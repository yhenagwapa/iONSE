import { faker } from '@faker-js/faker';

export function employeeValidFaker() {

    const employeeNumber = faker.string.numeric(4);
    const employeeId = `11-${employeeNumber}`;
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const extensionName = faker.person.suffix();
    const username = faker.internet.username({ firstName, lastName, length: { min: 5, max: 10 } });
    const email = faker.internet.email();
    const confirmEmail = email;
    const password = "Dswd@12345!!";
    const confirmPassword = password;

    const position = "Administrative Officer I";
    const designation = "Employee";
    const employmentStatus = "Cos";
    const fundSource = "Assistance to Individuals in Crisis Situation";

    const areaOfAssignment = "RPMO";
    const division = "Protective Service Division";
    const unitSection = "Crisis Intervention Section";

    const userType = "Employee";

    return {
        employeeId,
        username,
        firstName,
        middleName,
        lastName,
        extensionName,
        email,
        confirmEmail,
        password,
        confirmPassword,
        position,
        designation,
        employmentStatus,
        fundSource,
        areaOfAssignment,
        division,
        unitSection,
        userType
    };
}

export function employeeInvalidFaker() {

    const specialChars = '~!@#$%^&*()_+{}|:"<>?`[];/=1234567890-.,';
    const invalidInput = faker.string.fromCharacters(specialChars, { min: 3, max: 10 })

    return {
        invalidInput
    }
}