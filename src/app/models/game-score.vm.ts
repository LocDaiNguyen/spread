export interface GameScoreVM {
  _id: string;
  type: string;
  gameNum: number;
  weekNum: number;
  gameTimeEastern: string;
  homeTeam: string;
  homeCity: string;
  homeName: string;
  homeSpreadDisplay: string;
  homeSpread: number;
  homeScore: number;
  homeResult: string;
  awayTeam: string;
  awayCity: string;
  awayName: string;
  awaySpreadDisplay: string;
  awaySpread: number;
  awayScore: number;
  awayResult: string;
}
