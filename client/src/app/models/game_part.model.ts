export class GamePart {
  id: any;
  part: number;
  game: string;
  room: string;
  turns: [{
    user: string,
    card: string,
    card_rank: number,
    whom: string,
    move_type: string
  }];
  ended: boolean;
}
