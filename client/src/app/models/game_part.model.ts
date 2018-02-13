export class GamePart {
  id: any;
  part: number;
  game: string;
  room: string;
  turns: [{
    user: string,
    card: string,
    whom: string,
    move_type: string
  }];
  ended: boolean;
}
