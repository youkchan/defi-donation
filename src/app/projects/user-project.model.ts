export class UserProject {
   constructor(
     public userAddress: string,
     public amount: number,
     public projectAddress: string,
     public id: string,
     public delFlg: number
   ) {}
}
