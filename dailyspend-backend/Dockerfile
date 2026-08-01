# ─── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom first (cache dependency layer)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -q

# Copy source and build the fat JAR (skip tests — run them in CI separately)
COPY src ./src
RUN ./mvnw package -DskipTests -q

# ─── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Give ownership to the non-root user
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
