import { BASE_API_URL } from "core/config/consts";
import { httpConfig } from "core/config/http";
import kebabCase from "lodash/kebabCase";
import { Profile, ProfileChangePassword } from "core/models/Profile";
import { Repository } from "react3l-common";
import { Observable } from "rxjs";
import nameof from "ts-nameof.macro";
import { TenantConfiguration } from "core/models/TenantConfiguration";

export const API_PROFILE_PREFIX = "rpc/portal/profile";

export class ProfileRepository extends Repository {
  constructor() {
    super(httpConfig);
    this.baseURL = new URL(API_PROFILE_PREFIX, BASE_API_URL).href;
  }

  public get = (): Observable<Profile> => {
    return this.http
      .post<Profile>(kebabCase(nameof(this.get)), {})
      .pipe(Repository.responseMapToModel<Profile>(Profile));
  };

  public changePassword = (
    profileChangePassword: ProfileChangePassword
  ): Observable<ProfileChangePassword> => {
    return this.http
      .post<ProfileChangePassword>(
        kebabCase(nameof(this.changePassword)),
        profileChangePassword
      )
      .pipe(
        Repository.responseMapToModel<ProfileChangePassword>(
          ProfileChangePassword
        )
      );
  };

  public switchEmail = (profile: Profile): Observable<Profile> => {
    return this.http
      .post<Profile>(kebabCase(nameof(this.switchEmail)), profile)
      .pipe(Repository.responseMapToModel<Profile>(Profile));
  };

  public switchNotification = (profile: Profile): Observable<Profile> => {
    return this.http
      .post<Profile>(kebabCase(nameof(this.switchNotification)), profile)
      .pipe(Repository.responseMapToModel<Profile>(Profile));
  };

  public tenantConfiguration = (): Observable<TenantConfiguration[]> => {
    return this.http
      .post<TenantConfiguration[]>(
        kebabCase(nameof(this.tenantConfiguration)),
        {}
      )
      .pipe(
        Repository.responseMapToList<TenantConfiguration>(TenantConfiguration)
      );
  };

  public randomPassword = (): Observable<string> => {
    return this.http
      .post<string>(kebabCase(nameof(this.randomPassword)), {})
      .pipe(Repository.responseDataMapper<string>());
  };
}

export const profileRepository = new ProfileRepository();
