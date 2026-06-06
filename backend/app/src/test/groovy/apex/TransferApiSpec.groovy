package apex

import spock.lang.Specification
import spock.lang.Shared
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.net.URI

class TransferApiSpec extends Specification {

    @Shared HttpClient client = HttpClient.newHttpClient()

    def "Fintech Edge Case Validation Matrix"() {
        given: "A prepared transactional payload"
        def payload = """
            {
                "fromAccountId": "$sender",
                "toAccountId": "$receiver",
                "amount": $amount,
                "currency": "GBP"
            }
        """

        def request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/transfer"))
                .header("Content-Type", "application/json")
                .header("X-Idempotency-Key", key)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build()

        when: "The request hits the core processing gateway"
        def response = client.send(request, HttpResponse.BodyHandlers.ofString())

        then: "The system enforces strict data integrity rules"
        response.statusCode() == expectedStatus

        where: "The scenario matrix is executed"
        scenario                 | sender        | receiver      | amount  | key              || expectedStatus
        "Valid Transfer"         | "CORP-UK-001" | "CORP-US-002" | 10.00   | UUID.randomUUID()|| 200
        "Insufficient Funds"     | "CORP-US-002" | "CORP-UK-001" | 9999999 | UUID.randomUUID()|| 400
        "Missing Idempotency Key"| "CORP-UK-001" | "CORP-US-002" | 5.00    | ""               || 400
    }

    def "Strict Idempotency Double-Spend Defense"() {
        given: "A fixed idempotency key to simulate a rapid double-tap"
        def sharedKey = "duplicate-lock-" + UUID.randomUUID().toString()
        def payload = """
            {
                "fromAccountId": "CORP-UK-001",
                "toAccountId": "CORP-US-002",
                "amount": 1.00,
                "currency": "GBP"
            }
        """

        def req1 = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/transfer"))
                .header("Content-Type", "application/json")
                .header("X-Idempotency-Key", sharedKey)
                .POST(HttpRequest.BodyPublishers.ofString(payload)).build()

        when: "Two identical requests are fired consecutively"
        def res1 = client.send(req1, HttpResponse.BodyHandlers.ofString())
        def res2 = client.send(req1, HttpResponse.BodyHandlers.ofString())

        then: "The first succeeds and the second is safely blocked by Redis"
        res1.statusCode() == 200
        res2.statusCode() == 409
    }
}