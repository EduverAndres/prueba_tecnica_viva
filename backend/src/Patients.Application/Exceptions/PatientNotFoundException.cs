namespace Patients.Application.Exceptions;

public class PatientNotFoundException : Exception
{
    public PatientNotFoundException(int patientId)
        : base($"Patient with id {patientId} was not found.") { }
}
