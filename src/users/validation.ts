export const MIN_PASSWORD_LENGTH = 6;

interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// A new user needs a starting password. When editing, a blank password keeps the current one.
export const canSaveUser = (values: UserFormValues, isEdit: boolean): boolean => {
  const passwordOk = values.password.length === 0 ? isEdit : values.password.length >= MIN_PASSWORD_LENGTH;
  return values.firstName.trim() !== '' && values.lastName.trim() !== '' && values.email.includes('@') && passwordOk;
};
