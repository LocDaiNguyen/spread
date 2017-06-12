export interface StandingVM {
  _id: string;
  userName: string;
  avatar: string;
  wins: number;
  losses: number;
  pushs: number;
  points: number;
  rank?: number;
}
