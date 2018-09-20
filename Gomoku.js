/*********** define ***********/

class Gomoku {
	constructor (context) {
		this.title 			= document.getElementById('title'); //控制标题
		this.canBack 		= false; 	 //是否可以悔棋
		this.canConcel  = false; 	 //是否可以取消悔棋
		this.chessBoard = []; 		 //棋盘数组
		this.player 		= true;		 //是否是玩家操作
		this.wins 			= [];			 //赢法数组
		this.count 			= 0;			 //赢法总数
		this.playerWin  = []; 		 //玩家赢法数组
		this._playerWin = []; 		 //玩家赢法数组状态存储
		this.AIWin 			= []; 		 //电脑赢法数组
		this._AIWin 		= []; 		 //电脑赢法数组状态存储
		this.over 			= false; 	 //游戏是否结束
		this.ctx 				= context; //canvas 上下文环境
		this.rate 			= 40; 		 //每个格子大小 40 x 40
		this.lines		  = 15; 		 //棋盘 15 x 15
		this.width 			= 580; 		 //棋盘宽度
		this.height		  = 580; 		 //棋盘高度
		this._curPP 		= {				 //玩家当前下的棋子位置存储
			i: 0, j: 0
		};
		this._curAIP	  = { 			 //电脑当前下的棋子位置存储
			i: 0, j: 0
		};

		this.init(); //启动初始化
	}

	init () { //初始化
		//初始化游戏
		this.over = false;
		this.player = true;
		this.title.innerHTML = '--五星连珠--';

		//画棋盘
		this.drawChessBoard();

		//棋盘数组
		for (let i = 0; i < this.lines; i++) {
			this.chessBoard[i] = [];

			for (let j = 0; j < this.lines; j++) {
				this.chessBoard[i][j] = 0;
			}
		}

		//赢法数组
		for (let i = 0; i < this.lines; i++) {
			this.wins[i] = [];

			for (let j = 0; j < this.lines; j++) {
				this.wins[i][j] = [];
			}
		}

		//计算所有赢法
		this.winCollection();

		//玩家和AI赢法数组
		for (let i = 0; i < this.count; i++) {
			this.playerWin[i] = 0;
			this.AIWin[i] = 0;
		}
	}

	drawChessBoard () {
		//画棋盘背景
		this.ctx.beginPath();
		this.ctx.fillStyle = '#FFBB00'; //棋盘背景颜色
		this.ctx.fillRect(0, 0, 600, 600); //绘制矩形
		this.ctx.closePath();
		this.ctx.fill();

		//画线条
		for (let i = 0; i < this.lines; i++) {
			//画横线
			this.ctx.beginPath();
			this.ctx.moveTo(20, i * this.rate + 20);
			this.ctx.lineTo(this.width, i * this.rate + 20);
			this.ctx.closePath();
			this.ctx.stroke();

			//画竖线
			this.ctx.beginPath();
			this.ctx.moveTo(i * this.rate + 20, 20);
			this.ctx.lineTo(i * this.rate + 20, this.height);
			this.ctx.closePath();
			this.ctx.stroke();
		}

		//画棋盘上的五个定位点
		this.ctx.beginPath();
		this.ctx.arc(140, 140, 5, 0, 2 * Math.PI);
		this.ctx.fillStyle = '#000000';
		this.ctx.closePath();
		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.arc(460, 140, 5, 0, 2 * Math.PI);
		this.ctx.fillStyle = '#000000';
		this.ctx.closePath();
		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.arc(300, 300, 5, 0, 2 * Math.PI);
		this.ctx.fillStyle = '#000000';
		this.ctx.closePath();
		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.arc(140, 460, 5, 0, 2 * Math.PI);
		this.ctx.fillStyle = '#000000';
		this.ctx.closePath();
		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.arc(460, 460, 5, 0, 2 * Math.PI);
		this.ctx.fillStyle = '#000000';
		this.ctx.closePath();
		this.ctx.fill();
	}

	winCollection () { //所有赢法
		//横线
		for (let i = 0; i < 15; i++) {
			for (let j = 0; j < 11; j++) { //0-11,是因为还需四个棋子才能形成五连珠
				for (let k = 0; k < 5; k++) { //k变量代表五连珠中其中一个
					this.wins[i][j+k][this.count] = true;
				}

				this.count++;
			}
		}

		//竖线
		for (let i = 0; i < 15; i++) {
			for (let j= 0; j < 11; j++) {
				for (let k = 0; k < 5; k++) {
					this.wins[j+k][i][this.count] = true;
				}

				this.count++;
			}
		}

		//斜线
		for (let i = 0; i < 11; i++) {
			for (let j= 0; j < 11; j++) {
				for (let k = 0; k < 5; k++) {
					this.wins[i+k][j+k][this.count] = true;
				}

				this.count++;
			}
		}

		//反斜线
		for (let i = 0; i < 11; i++) {
			for (let j= 14; j > 3; j--) {
				for (let k = 0; k < 5; k++) {
					this.wins[i+k][j-k][this.count] = true;
				}

				this.count++;
			}
		}
	}

	drawChessman (x, y) { //画棋子
		this.ctx.beginPath();
		this.ctx.arc(x, y, this.rate / 2, 0, 2 * Math.PI); //圆形棋子

		if (this.player) {
			this.ctx.fillStyle = '#000000';
		} else {
			this.ctx.fillStyle = '#FFFFFF';
		}

		this.ctx.fill();
		this.ctx.closePath();
		this.ctx.stroke();
	}

	playerRound (event, chess) { //玩家下棋
		if (this.over) { //如果游戏结束，锁定棋盘
			return;
		}

		let mouseX = event.clientX; 	   //鼠标x轴位置
		let mouseY = event.clientY; 	   //鼠标y轴位置
		let chessX = chess.offsetLeft; 	 //棋盘x轴位置
		let chessY = chess.offsetTop;  	 //棋盘y轴位置
		let tmpX = mouseX - chessX - 20; //鼠标在棋盘上的位置，-20是因为棋盘有20大小的边距
		let tmpY = mouseY - chessY - 20;

		if (tmpX >= 0 && tmpY >= 0) { //如果鼠标在棋盘范围内，则继续执行
			let i = (tmpX / this.rate).toFixed(); //四舍五入
			let j = (tmpY / this.rate).toFixed();
			let X = i * this.rate + 20;
			let Y = j * this.rate + 20;

			this._curPP.i = i; //存储状态
			this._curPP.j = j;

			if (this.chessBoard[i][j] === 0) { //判断当前位置是否有棋子
				this.drawChessman(X, Y);
				this.chessBoard[i][j] = 1;
					
				for (let k = 0; k < this.count; k++) { //判断当前位置玩家赢法
					if (this.wins[i][j][k]) {
						this.playerWin[k]++;
						this._AIWin[k] = this.AIWin[k]; //存储电脑赢法状态
						this.AIWin[k] = 6;

						if (this.playerWin[k] === 5) { //如果达成五连珠，胜利
							this.title.innerHTML = '玩家胜！';

							this.over = true; //游戏结束
						}
					}
				}

				if(!this.over){
					this.player = !this.player; //切换角色
				}

				this.AIRound(); //电脑下棋
			}
		}

		this.canBack = true;
	}

	AIRound () { //电脑下棋
		if (this.over) { //如果游戏结束，锁定棋盘
			return;
		}

		let playerScore = []; //玩家评分
		let AIScore = []; //电脑评分
		let max = 0; //最高分数
		let ii = 0, jj = 0; //得分最高的坐标

		for (let i = 0; i < this.lines; i++) { //初始化评分
			playerScore[i] = [];
			AIScore[i] = [];

			for (let j = 0; j < this.lines; j++) {
				playerScore[i][j] = 0;
				AIScore[i][j] = 0;
			}
		}

		for (let i = 0; i < this.lines; i++) {
			for (let j = 0; j < this.lines; j++) {
				if (this.chessBoard[i][j] === 0) {

					for (let k = 0; k < this.count; k++) {
						if (this.wins[i][j][k]) {
							if (this.playerWin[k] === 1) {
								playerScore[i][j] += 200;
							} else if (this.playerWin[k] === 2) {
								playerScore[i][j] += 400;
							} else if (this.playerWin[k] === 3) {
								playerScore[i][j] += 2000;
							} else if (this.playerWin[k] === 4) {
								playerScore[i][j] += 10000;
							}

							if(this.AIWin[k] === 1){
								AIScore[i][j] += 220;
							} else if (this.AIWin[k] === 2) {
								AIScore[i][j] += 420;
							} else if (this.AIWin[k] === 3) {
								AIScore[i][j] += 2100;
							} else if (this.AIWin[k] === 4) {
								AIScore[i][j] += 20000;
							}
						}
					}

					if (playerScore[i][j] > max) {
						max = playerScore[i][j];
						ii = i;
						jj = j;			
					} else if (playerScore[i][j] === max) {
						if (AIScore[i][j] > AIScore[ii][jj]) {
							ii = i;
							jj = j;
						}
					}

					if (AIScore[i][j] > max) {
						max = AIScore[i][j];
						ii = i;
						jj = j;					
					} else if (AIScore[i][j] === max) {
						if (playerScore[i][j] > playerScore[ii][jj]) {
							ii = i;
							jj = j;
						}
					}
				}
			}
		}

		let AIX = ii * this.rate + 20;
		let AIY = jj * this.rate + 20;
		this._curAIP.i = ii; //存储电脑下棋的位置
		this._curAIP.j = jj;

		this.drawChessman(AIX, AIY); //画棋子
		this.chessBoard[ii][jj] = 2; //设置电脑棋子标志

		for (let k = 0; k < this.count; k++) {
			if (this.wins[ii][jj][k]) {
				this.AIWin[k]++;
				this._playerWin[k] = this.playerWin[k];
				this.playerWin[k] = 6;

				if (this.AIWin[k] === 5) {
					this.title.innerHTML = '电脑胜！';

					this.over = true;
				}
			}
		}

		if(!this.over){
			this.player = !this.player;
		}
	}

	back () {
		if (!this.canBack) {
			return;
		}
		//恢复角色
		this.over = false;
		this.player = true;

		//player 悔棋
		let pX = this._curPP.i * this.rate + 20 - this.rate / 2;
		let pY = this._curPP.j * this.rate + 20 - this.rate / 2;

		this.destroyChessPiece(pX, pY); //销毁棋子
		this.chessBoard[this._curPP.i][this._curPP.j] = 0;

		for (let k = 0; k < this.count; k++) {
			if (this.wins[this._curPP.i][this._curPP.j][k]) {
				this.playerWin[k]--;
				this.AIWin[k] = this._AIWin[k];
			}
		}

		//AI 悔棋
		let AIX = this._curAIP.i * this.rate + 20 - this.rate / 2;
		let AIY = this._curAIP.j * this.rate + 20 - this.rate / 2;
		
		this.destroyChessPiece(AIX, AIY);
		this.chessBoard[this._curAIP.i][this._curAIP.j] = 0;

		for (let k = 0; k < this.count; k++) {
			if (this.wins[this._curAIP.i][this._curAIP.j][k]) {
				this.AIWin[k]--;
				this.playerWin[k] = this._playerWin[k];
			}
		}

		this.title.innerHTML = '--五星连珠--';
		this.canConcel = true;
	}

	cancel () {
		if (!this.canConcel) {
			return;
		}

		//图形恢复
		let pi = this._curPP.i * this.rate + 20;
		let pj = this._curPP.j * this.rate + 20;
		let pX = pi - this.rate / 2;
		let pY = pj - this.rate / 2;
		let AIi = this._curAIP.i * this.rate + 20;
		let AIj = this._curAIP.j * this.rate + 20;
		let AIX = AIi - this.rate / 2;
		let AIY = AIj - this.rate / 2;

		this.ctx.beginPath();
		this.ctx.fillStyle = '#FFBB00';
		this.ctx.fillRect(pX, pY, this.rate, this.rate);
		this.ctx.closePath();
		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.fillStyle = '#FFBB00';
		this.ctx.fillRect(AIX, AIY, this.rate, this.rate);
		this.ctx.closePath();
		this.ctx.fill();

		this.drawChessman(pi, pj);
		this.player = !this.player;
		this.drawChessman(AIi, AIj);

		//数据恢复
		//player 恢复
		this.chessBoard[this._curPP.i][this._curPP.j] = 1;

		for (let k = 0; k < this.count; k++) {
			if (this.wins[this._curPP.i][this._curPP.j][k]) {
				this.playerWin[k]++;
				this.AIWin[k] = 6;

				if (this.playerWin[k] === 5) {
					this.title.innerHTML = '玩家胜！';

					this.over = true;
				}
			}
		}

		//AI 恢复
		this.chessBoard[this._curAIP.i][this._curAIP.j] = 2;

		for (let k = 0; k < this.count; k++) {
			if (this.wins[this._curAIP.i][this._curAIP.j][k]) {
				this.AIWin[k]++;
				this.playerWin[k] = 6;

				if (this.AIWin[k] === 5) {
					this.title.innerHTML = '电脑胜！';

					this.over = true;
				}
			}
		}

		if (!this.over) {
			this.player = !this.player;
		}

		this.canConcel = false;
	}

	destroyChessPiece (x, y) { //销毁棋子
		//擦除棋子
		this.ctx.clearRect(x, y, this.rate, this.rate);

		//恢复背景颜色
		this.ctx.beginPath();
		this.ctx.fillStyle = '#FFBB00';
		this.ctx.fillRect(x, y, this.rate, this.rate);
		this.ctx.closePath();
		this.ctx.fill();

		//恢复线条
		this.ctx.beginPath();
		this.ctx.moveTo(x, y + this.rate / 2);
		this.ctx.lineTo(x + this.rate, y + this.rate / 2);
		this.ctx.closePath();
		this.ctx.stroke();
		
		this.ctx.beginPath();
		this.ctx.moveTo(x + this.rate / 2, y);
		this.ctx.lineTo(x + this.rate / 2, y + this.rate);
		this.ctx.closePath();
		this.ctx.stroke();
	}
}

/*********** start ***********/

//获取标签控制
let chess = document.getElementById('Gomoku');
let ctx = chess.getContext('2d');

let gomoku = new Gomoku(ctx);

//添加监听事件
chess.addEventListener('click', (event) => {
	gomoku.playerRound(event, chess);
});

let restart = document.getElementById('restart');
restart.addEventListener('click', () => {
	gomoku.init();
});

let back = document.getElementById('back');
back.addEventListener('click', () => {
	gomoku.back();
});

let cancel = document.getElementById('cancel');
cancel.addEventListener('click', () => {
	gomoku.cancel();
});