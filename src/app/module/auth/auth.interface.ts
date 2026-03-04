interface IRegisterUser {
  name: string;
  email: string;
  password: string;
}

interface ILoginUser {
  email: string;
  password: string;
}

export { IRegisterUser, ILoginUser };