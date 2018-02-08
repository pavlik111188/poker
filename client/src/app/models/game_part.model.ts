export class GamePart {
  id: any;
  part: number;
  game: string;
  room: string;
  turns: [{
    user: string,
    card: string
  }];
  ended: boolean;
}
