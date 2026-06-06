package apex;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

public class RedisConfig {
    private static JedisPool jedisPool;

    public static void initialize() {
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(128); 
        String redisHost = System.getenv("REDIS_URL") != null ? System.getenv("REDIS_URL") : "localhost";
        jedisPool = new JedisPool(poolConfig, redisHost, 6379);
    }

    public static Jedis getConnection() {
        if (jedisPool == null) {
            initialize();
        }
        return jedisPool.getResource();
    }
}