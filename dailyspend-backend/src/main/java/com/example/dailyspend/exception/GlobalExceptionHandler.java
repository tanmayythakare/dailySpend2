package com.example.dailyspend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return new ResponseEntity<>(
                new ApiError(HttpStatus.NOT_FOUND.value(), ex.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiError> handleForbidden(ForbiddenException ex) {
        return new ResponseEntity<>(
                new ApiError(HttpStatus.FORBIDDEN.value(), ex.getMessage()),
                HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<ApiError> handleBadRequest(RuntimeException ex) {
        return new ResponseEntity<>(
                new ApiError(HttpStatus.BAD_REQUEST.value(), ex.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {

        String errorMessage = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Validation error");

        return new ResponseEntity<>(
                new ApiError(HttpStatus.BAD_REQUEST.value(), errorMessage),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(
                new ApiError(HttpStatus.FORBIDDEN.value(), "You do not have access to this record"),
                HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        return new ResponseEntity<>(
                new ApiError(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Something went wrong"
                ),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
