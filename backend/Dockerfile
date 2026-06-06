FROM gradle:8.5-jdk21 AS builder

WORKDIR /home/gradle/project

COPY --chown=gradle:gradle . .

RUN ./gradlew :app:installDist -x test

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /home/gradle/project/app/build/install/app /app

EXPOSE 8080

ENTRYPOINT ["/app/bin/app"]