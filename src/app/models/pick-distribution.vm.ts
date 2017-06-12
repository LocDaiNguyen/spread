export interface PickDistributionVM {
  _id: string;
  weekNum: number;
  gameTimeEastern: string;
  homeTeam: string;
  homeCity: string;
  homeName: string;
  homeSpreadDisplay: string;
  homeSpread: number;
  homeScore: number;
  homeResult: string;
  homePicksCount: number;
  homePercentage: string;
  homePicks: {pickedTeam: string, userName: string}[];
  awayTeam: string;
  awayCity: string;
  awayName: string;
  awaySpreadDisplay: string;
  awaySpread: number;
  awayScore: number;
  awayResult: string;
  awayPicksCount: number;
  awayPercentage: string;
  awayPicks: {pickedTeam: string, userName: string}[];
  isGameStarted: boolean;
}
