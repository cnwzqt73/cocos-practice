import { _decorator, Component, game, instantiate, Label, Node, Prefab, Sprite, Vec3 } from 'cc';
import { TileState } from './TileState';
import { TileCell } from './TileCell';

const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {
    
    public state: TileState = null;
    public cell: TileCell = null;
    public number: number = 0;
    public locked: boolean = false;

    private _background: Sprite = null;
    private _text: Label = null;


    protected onLoad(): void {
        this._background = this.getComponent(Sprite);
        this._text = this.getComponentInChildren(Label);
    }

    public setState(state: Prefab, number: number): void {
        let tileState = instantiate(state).getComponent(TileState);
        this.node.getComponentInChildren(TileState)?.node?.destroy();
        this.node.addChild(tileState.node);

        this.state = tileState;
        this.number = number;

        this._background.color = tileState.backgroundColor;
        this._text.color = tileState.textColor;
        this._text.string = number.toString();
    }

    public spawn(cell: TileCell): void {
        if (this.cell !== null) {
            this.cell.tile = null;
        }

        this.cell = cell;
        this.cell.tile = this;

        this.node.worldPosition = this.cell.node.worldPosition.clone();
    }

    public moveTo(cell: TileCell): void {
        if (this.cell !== null) {
            this.cell.tile = null;
        }

        this.cell = cell;
        this.cell.tile = this;

        this._animate(cell.node.worldPosition.clone(), false);
    }

    public merge(cell: TileCell): void {
        if (this.cell !== null) {
            this.cell.tile = null;
        }

        this.cell = null;
        cell.tile.locked = true;

        this._animate(cell.node.worldPosition.clone(), true);
    }

    private _animate(to: Vec3, merging: boolean): void {
        let elapsed = 0;
        let duration = 0.1;

        let from = this.node.worldPosition.clone();
        let callback = () => {
            this.node.worldPosition = from.lerp(to, elapsed / duration).clone();

            elapsed += game.deltaTime;
            if (elapsed > duration) {
                this.node.worldPosition = to;

                if (merging) this.node.destroy();

                this.unschedule(callback);
            }
        }

        this.schedule(callback);
    }
}


