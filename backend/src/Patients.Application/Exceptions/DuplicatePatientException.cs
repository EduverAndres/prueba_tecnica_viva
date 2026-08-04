namespace Patients.Application.Exceptions;

public class DuplicatePatientException : Exception
{
    public DuplicatePatientException(string documentType, string documentNumber)
        : base($"A patient with document type '{documentType}' and number '{documentNumber}' already exists.") { }

    public DuplicatePatientException(string message)
        : base(message) { }
}
