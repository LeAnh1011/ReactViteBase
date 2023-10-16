import { BASE_API_URL } from "core/config/consts";
import { httpConfig } from "core/config/http";
import { LoginUser } from "core/models/LoginUser";
import kebabCase from "lodash/kebabCase";
import { Repository } from "react3l-common";
import { Observable } from "rxjs";
import nameof from "ts-nameof.macro";

interface OTPParam {
  email: string;
  otpCode: string;
}

interface RecoveryPasswordParam {
  password: string;
  email: string;
  otpCode: string;
}

export const API_AUTHENTICATION_PREFIX = "rpc/portal/authentication";

export class AuthenticationRepository extends Repository {
  constructor() {
    super(httpConfig);
    this.baseURL = new URL(API_AUTHENTICATION_PREFIX, BASE_API_URL).href;
  }

  public login = (user: LoginUser): Observable<LoginUser> => {
    return this.http
      .post<LoginUser>(kebabCase(nameof(this.login)), user)
      .pipe(Repository.responseMapToModel<LoginUser>(LoginUser));
  };

  public logout = (): Observable<unknown> => {
    return this.http.post<unknown>(kebabCase(nameof(this.logout)), {});
  };

  public loginByGmail = (user: LoginUser): Observable<LoginUser> => {
    return this.http
      .post<LoginUser>(kebabCase(nameof(this.loginByGmail)), user)
      .pipe(Repository.responseMapToModel<LoginUser>(LoginUser));
  };

  public get = (): Observable<LoginUser> => {
    return this.http
      .post<LoginUser>(kebabCase(nameof(this.get)))
      .pipe(Repository.responseMapToModel<LoginUser>(LoginUser));
  };

  public forgotPassword = (email: string): Observable<LoginUser> => {
    return this.http
      .post<LoginUser>(kebabCase(nameof(this.forgotPassword)), { email })
      .pipe(Repository.responseMapToModel<LoginUser>(LoginUser));
  };

  public verifyOtpCode = (obj: OTPParam): Observable<LoginUser> => {
    return this.http
      .post<LoginUser>(kebabCase(nameof(this.verifyOtpCode)), obj)
      .pipe(Repository.responseMapToModel<LoginUser>(LoginUser));
  };

  public recoveryPassword = (
    obj: RecoveryPasswordParam
  ): Observable<LoginUser> => {
    return this.http
      .post<LoginUser>(kebabCase(nameof(this.recoveryPassword)), obj)
      .pipe(Repository.responseMapToModel<LoginUser>(LoginUser));
  };

  public refreshToken = (): Observable<number> => {
    return this.http
      .post<number>(kebabCase(nameof(this.refreshToken)))
      .pipe(Repository.responseDataMapper<number>());
  };
}

export const authenticationRepository = new AuthenticationRepository();
