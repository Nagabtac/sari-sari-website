package myuniquesite.blerp.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import ch.qos.logback.core.model.Model;

/**
 * Global exception handling for the application.
 * The generic exception handler is now explicitly configured to return JSON
 * (using the OutputStream) to prevent the conflict with Thymeleaf's use of the
 * Writer.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles ResourceNotFoundException, returning a 404 Not Found response as
     * structured JSON.
     * This handler ensures API-style errors use the OutputStream.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiError apiError = new ApiError("Resource Not Found", ex.getMessage());
        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles DataIntegrityViolationException, typically caused by foreign key
     * constraints.
     * Returns a 409 Conflict response with a user-friendly message.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ResponseEntity<ApiError> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = "Data integrity violation: " + ex.getMostSpecificCause().getMessage();

        // Provide more helpful context if possible, but don't assume it's a delete
        // operation
        String specificMessage = ex.getMostSpecificCause().getMessage();
        if (specificMessage != null) {
            if (specificMessage.contains("foreign key") && specificMessage.contains("delete")) {
                message = "Cannot delete this record because it is referenced by other records.";
            } else if (specificMessage.contains("foreign key")) {
                message = "Foreign key constraint violation: A referenced record was not found.";
            } else if (specificMessage.contains("Column '")) {
                message = "Database column error: " + specificMessage;
            }
        }

        ApiError apiError = new ApiError(
                "Data Integrity Violation",
                message);

        return new ResponseEntity<>(apiError, HttpStatus.CONFLICT);
    }

    /**
     * Catches all other generic exceptions and forces a structured JSON response
     * (500 Internal Server Error).
     * * KEY FIX: By returning ResponseEntity and annotating with @ResponseBody, we
     * guarantee
     * that Spring uses the binary stream (OutputStream) to serialize the ApiError
     * object to JSON.
     * This prevents the DispatcherServlet from trying to use the Thymeleaf View
     * Resolver,
     * thus avoiding the call to getWriter() that causes the IllegalStateException.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ResponseBody
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        // Log the error details for crucial debugging
        System.err.println("CRITICAL UNHANDLED EXCEPTION: " + ex.getMessage());
        ex.printStackTrace();

        ApiError apiError = new ApiError(
                "Internal Server Error",
                "An unexpected error occurred. Please check server logs for details. Exception: "
                        + ex.getClass().getSimpleName());

        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleMethodAgumentNotValid(MethodArgumentNotValidException ex,
            Model model) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
