using FluentValidation;
using Patients.Application.DTOs;

namespace Patients.Application.Validators;

public class CreatePatientValidator : AbstractValidator<CreatePatientRequest>
{
    public CreatePatientValidator()
    {
        RuleFor(x => x.DocumentType).NotEmpty().MaximumLength(10);
        RuleFor(x => x.DocumentNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(80);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(80);
        RuleFor(x => x.BirthDate)
            .Must(date => date <= DateTime.UtcNow.Date)
            .WithMessage("BirthDate cannot be in the future.");
        RuleFor(x => x.PhoneNumber).MaximumLength(20);
        RuleFor(x => x.Email).MaximumLength(120).EmailAddress();
    }
}
