export interface Game {
  _id?: string;
  gameNum: number;
  weekNum: number;
  gameTimeEastern: string;
  homeTeam: string;
  homeSpreadDisplay: string;
  homeSpread: number;
  homeScore: number;
  homeResult: string;
  awayTeam: string;
  awaySpreadDisplay: string;
  awaySpread: number;
  awayScore: number;
  awayResult: string;
}
