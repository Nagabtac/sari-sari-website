package myuniquesite.blerp.converter;

import myuniquesite.blerp.model.Payment.PaymentStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PaymentStatusConverter implements AttributeConverter<PaymentStatus, String> {

    @Override
    public String convertToDatabaseColumn(PaymentStatus status) {
        if (status == null) {
            return null;
        }
        switch (status) {
            case PARTIALY:
                return "partialy";
            case FULLY_PAID:
                return "fully_paid";
            case FULL_BALANCE:
                return "full_balance";
            default:
                throw new IllegalArgumentException("Unknown payment status: " + status);
        }
    }

    @Override
    public PaymentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        switch (dbData) {
            case "partialy":
                return PaymentStatus.PARTIALY;
            case "fully_paid":
                return PaymentStatus.FULLY_PAID;
            case "full_balance":
                return PaymentStatus.FULL_BALANCE;
            default:
                throw new IllegalArgumentException("Unknown payment status: " + dbData);
        }
    }
}

