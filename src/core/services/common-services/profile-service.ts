import { Profile } from "core/models/Profile";
import { BehaviorSubject, Observable } from "rxjs";

class ProfileService {
  public profileSubject: BehaviorSubject<Profile>;
  public profile: Observable<Profile>;
  public get profileValue(): Profile {
    return this.profileSubject.value;
  }

  constructor() {
    const profileInfo = localStorage.getItem("profile");
    this.profileSubject = new BehaviorSubject<Profile>(
      profileInfo ? JSON.parse(profileInfo) : null
    );
    this.profile = this.profileSubject.asObservable();
  }
}
const profileService = new ProfileService();
export default profileService;
