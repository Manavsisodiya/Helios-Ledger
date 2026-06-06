package apex;

import redis.clients.jedis.Jedis;
import static spark.Spark.*;
import java.sql.Connection;
import java.math.BigDecimal;
import java.util.UUID;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.Result;
import org.jooq.impl.DSL;
import com.google.gson.Gson;

public class App {
    public static void main(String[] args) {
        port(8080);

        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }
            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }
            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Idempotency-Key");
            response.type("application/json");
        });
      
        try {
            DatabaseConfig.initialize();
            System.out.println(">>> Database Pool Successfully Initialized <<<");
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to initialize database connection: " + e.getMessage());
        }

        try {
            RedisConfig.initialize();
            System.out.println(">>> Redis Cache Successfully Initialized <<<");
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to initialize Redis: " + e.getMessage());
        }

        get("/api/health", (req, res) -> "{\"status\":\"Apex Core is Live\"}");

        Gson gson = new Gson();

        get("/api/accounts", (req, res) -> {
            try (Connection conn = DatabaseConfig.getConnection()) {
                DSLContext create = DatabaseConfig.getDSL(conn);
                Result<Record> result = create.select().from(DSL.table("accounts")).fetch();
                
                return gson.toJson(result.intoMaps());
                
            } catch (Exception e) {
                res.status(500);
                return "{\"error\":\"Failed to fetch data: " + e.getMessage() + "\"}";
            }
        });
        post("/api/transfer", (req, res) -> {
            String idempotencyKey = req.headers("X-Idempotency-Key");
            if (idempotencyKey == null || idempotencyKey.isEmpty()) {
                res.status(400);
                return "{\"error\":\"Missing X-Idempotency-Key header. Transaction blocked.\"}";
            }

            try (Jedis jedis = RedisConfig.getConnection()) {
                long isNewRequest = jedis.setnx("tx:" + idempotencyKey, "processing");
                
                if (isNewRequest == 0) {
                    res.status(409); // 409 Conflict
                    return "{\"error\":\"Duplicate transaction detected. Request safely ignored.\"}";
                }
                
                jedis.expire("tx:" + idempotencyKey, 86400);
            }

            TransferRequest transfer = gson.fromJson(req.body(), TransferRequest.class);
            
            try (Connection conn = DatabaseConfig.getConnection()) {
                DSLContext create = DatabaseConfig.getDSL(conn);
                
                create.transaction(configuration -> {
                    DSLContext trx = DSL.using(configuration);
                    
                    int debitResult = trx.update(DSL.table("accounts"))
                        .set(DSL.field("balance", BigDecimal.class), DSL.field("balance", BigDecimal.class).minus(transfer.amount))
                        .where(DSL.field("id", String.class).eq(transfer.fromAccountId))
                        .and(DSL.field("balance", BigDecimal.class).ge(BigDecimal.valueOf(transfer.amount))) 
                        .execute();
                        
                    if (debitResult == 0) {
                        throw new RuntimeException("Insufficient funds or invalid sender account.");
                    }

                    trx.update(DSL.table("accounts"))
                        .set(DSL.field("balance", BigDecimal.class), DSL.field("balance", BigDecimal.class).plus(transfer.amount))
                        .where(DSL.field("id", String.class).eq(transfer.toAccountId))
                        .execute();
                        
                    trx.insertInto(DSL.table("ledger_entries"), 
                        DSL.field("transaction_id"), DSL.field("from_account_id"), 
                        DSL.field("to_account_id"), DSL.field("amount"), 
                        DSL.field("currency"), DSL.field("status"))
                        .values(UUID.randomUUID().toString(), transfer.fromAccountId, 
                                transfer.toAccountId, transfer.amount, 
                                transfer.currency, "COMPLETED")
                        .execute();
                });
                
                res.status(200);
                return "{\"status\":\"Transfer Settled Successfully\"}";
                
            } catch (Exception e) {
                try (Jedis jedis = RedisConfig.getConnection()) {
                    jedis.del("tx:" + idempotencyKey);
                }
                res.status(400);
                return "{\"error\":\"Transfer Failed: " + e.getMessage() + "\"}";
            }
        });
    }
}