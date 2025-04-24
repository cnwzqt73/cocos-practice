import { _decorator, Component, find, game, Label, math, Node, sys, UIOpacity } from 'cc';
import { TileBoard } from './TileBoard';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    
    public board: TileBoard = null;
    public gameOverPanel: Node = null;
    public scoreText: Label = null;
    public hiscoreText: Label = null;

    private _score: number = 0;

    protected onLoad(): void {
        this.board = find('Canvas/Board').getComponent(TileBoard);
        this.gameOverPanel = find('Canvas/Board/GameOverPanel');
        this.scoreText = find('Canvas/Score/Value').getComponent(Label);
        this.hiscoreText = find('Canvas/Best/Value').getComponent(Label);
    }
    
    protected start(): void {
        this.newGame();
    }

    public newGame(): void {
        this.gameOverPanel.getComponent(UIOpacity).opacity = 0;
        this.gameOverPanel.active = false;

        this._score = 0;
        this.scoreText.string = 0..toString();
        this.hiscoreText.string = this._loadHiscore().toString();

        this.board.clearBoard();
        this.board.createTile();
        this.board.createTile();
        this.board.enabled = true;
    }

    public gameOver(): void {
        this.board.enabled = false;
        this.gameOverPanel.active = true;

        this._fade(this.gameOverPanel, 256, 1);        
    }

    private _fade(gameOverPanel: Node, to: number, delay: number): void {        
        this.scheduleOnce(() => {
            let elapsed = 0;
            let duration = 0.5;
            let opacity = gameOverPanel.getComponent(UIOpacity);
            let from = opacity.opacity;
            
            let callback = () => {
                opacity.opacity = math.lerp(from, to, elapsed / duration);
                elapsed += game.deltaTime;

                if (elapsed > duration) {
                    opacity.opacity = to;
                    this.unschedule(callback);
                }
            };
            this.schedule(callback);
        }, delay);
    } 

    public increaseScore(points: number): void {
        this._setScore(this._score + points);
    }

    private _setScore(score: number): void {
        this._score = score;

        this.scoreText.string = score.toString();
        this._saveHiscore();
    }

    private _saveHiscore(): void {
        let hiscore = this._loadHiscore();

        if (this._score > hiscore) {
            sys.localStorage.setItem('hiscore', this._score);
        }
    }

    private _loadHiscore(): number {
        return Number.parseInt(sys.localStorage.getItem('hiscore') ?? 0);
    }
}


