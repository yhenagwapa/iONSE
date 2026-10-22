import { faker } from '@faker-js/faker';

export function userTypeValidFaker() {

    const userTypeName = faker.person.jobType();

    const permissions = faker.helpers.arrayElement([
        { name: "Worklogs", values: ["View worklog page", "Generate worklog", "Edit DTR details", "Edit AR details", "Submit worklog", "Print worklog", "Export worklog"] },
        { name: "History", values: ["View history page", "View DTR history detail", "Donwload DTR history", "Print DTR history"] },
        { name: "DTR Review", values: ["View DTR review page", "View individual DTR", "Approve DTR", "Return DTR", "Bulk approve DTR"] },
        { name: "Import Attlog", values: ["View import attlog page", "Upload attlog file", "Confirm attlog import"] },
        { name: "Employee Management", values: ["View employee list", "Add employee", "Edit employee", "Deactivate employee", "Export employee list"] },
        { name: "OBSU Management", values: ["View OBSU list", "Add OBSU", "Edit OBSU", "Delete OBSU"] },
        { name: "User Type Management", values: ["View user type list", "Add user type", "Edit user type", "Delete user type"] },
        { name: "Audit Log Management", values: ["View audit log", "Export audit log"] }
    ]);

   
    return {
        userTypeName,
        permissionName: permissions.name,
        permissionValue: faker.helpers.arrayElement(permissions.values)
    };
}

export function userTypeInvalidFaker() {

    const specialChars = '~!@#$%^&*()_+{}|:"<>?`[];/=1234567890-.,';
    const invalidInput = faker.string.fromCharacters(specialChars, { min: 3, max: 10 });

    return {
        invalidInput
    }
}

export function editUserTypeValidFaker() {

        const userTypeName = faker.person.jobType();

    return {
        userTypeName
    };
}