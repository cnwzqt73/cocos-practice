import { _decorator, Component, EventKeyboard, find, input, Input, instantiate, KeyCode, math, Node, Prefab, v2, Vec2,  } from 'cc';
import { TileGrid } from './TileGrid';
import { Tile } from './Tile';
import { TileState } from './TileState';
import { GameManager } from './GameManager';

const { ccclass, property } = _decorator;

@ccclass('TileBoard')
export class TileBoard extends Component {

    @property(Prefab)
    public readonly tilePrefab: Prefab = null;
    @property([Prefab])
    public readonly tileStates: Prefab[] = []; // 这里使用预制体只是为了模仿教程。。。

    public gameManager: GameManager = null;

    private _grid: TileGrid = null;
    private _tiles: Array<Tile> = null;
    private _waiting: boolean = false;


    protected onLoad(): void {
        this._grid = this.getComponentInChildren(TileGrid);
        this._tiles = new Array();

        this.gameManager = find('/GameManager').getComponent(GameManager);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    protected onKeyDown(event: EventKeyboard): void {
        if (!this._waiting) {
            if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP) {
                this._moveTiles(v2(0, +1), 0, 1, 1, 1);
            } else if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN) {
                this._moveTiles(v2(0, -1), 0, 1, this._grid.height - 2, -1);
            } else if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) {
                this._moveTiles(v2(-1, 0), 1, 1, 0, 1);
            } else if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) {
                this._moveTiles(v2(+1, 0), this._grid.width - 2, -1, 0, 1);
            }
        }
    }

    public clearBoard(): void {
        this._grid.cells.forEach(cell => cell.tile = null);
        this._tiles.forEach(tile => tile.node.destroy());
        this._tiles = new Array();
    }

    public createTile(): void {
        let tile = instantiate(this.tilePrefab).getComponent(Tile);

        // 如果节点没有加入场景，组件上的 onLoad 是不会执行的。
        tile.node.setParent(this._grid.node);
        tile.setState(this.tileStates[0], 2);
        tile.spawn(this._grid.getRandomEmptyCell());

        this._tiles.push(tile);
    }

    private _moveTiles(direction: Vec2, startX: number, incrementX: number, startY: number, incrementY: number): void {
        let changed = false;

        for (let x = startX; x >= 0 && x < this._grid.width; x += incrementX) {
            for (let y = startY; y >= 0 && y < this._grid.height; y += incrementY) {
                let cell = this._grid.getCell(x, y);

                if (cell.occupied) {
                    // 因为逻辑或运算符的短路特性，表达式不能是这种形式： changed || this._moveTile(cell.tile, direction);
                    changed = this._moveTile(cell.tile, direction) || changed;
                }
            }
        }
        // 输入移动 Tile 时产生的 scheduler（在 tile._animate 里)是在下一帧统一执行的，
        // 所以只需要同步执行一次 _waitForChanges 即可。
        if (changed) this._waitForChanges();
    }

    private _moveTile(tile: Tile, direction: Vec2): boolean {
        let newCell = null;
        let adjacentCell = this._grid.getAdjacentCell(tile.cell, direction);

        while (adjacentCell !== null) {

            if (adjacentCell.occupied) {
                if (this._canMerge(tile, adjacentCell.tile)) {
                    this._merge(tile, adjacentCell.tile);
                    return true;
                }
                break;
            }

            newCell = adjacentCell;
            adjacentCell = this._grid.getAdjacentCell(adjacentCell, direction);
        }

        if (newCell !== null) {
            tile.moveTo(newCell);
            return true;
        }

        return false;
    }

    private _canMerge(a: Tile, b: Tile): boolean {
        return a.number === b.number && !b.locked;
    }

    private _merge(a: Tile, b: Tile): void {
        this._tiles.splice(this._tiles.indexOf(a), 1);
        a.merge(b.cell);

        let index = math.clamp(this._indexOf(b.state) + 1, 0, this.tileStates.length - 1);
        let number = b.number * 2;

        b.setState(this.tileStates[index], number);

        this.gameManager.increaseScore(number);
    }

    private _indexOf(state: TileState): number {
        for (let i = 0; i < this.tileStates.length; i++) {
            let s = instantiate(this.tileStates[i]).getComponent(TileState);

            if (state.equals(s)) {
                s.node.destroy();
                return i;

            }
            s.node.destroy();
        }

        return -1;
    }

    private _waitForChanges(): void {
        this._waiting = true;
        this.scheduleOnce(() => {
            this._waiting = false;

            this._tiles.forEach(tile => tile.locked = false);

            if (this._tiles.length !== this._grid.size)
                this.createTile();

            if (this._checkForGameOver())
                this.gameManager.gameOver();

        }, 0.1);
    }

    private _checkForGameOver(): boolean {
        if (this._tiles.length !== this._grid.size)
            return false;

        for (let tile of this._tiles) {
            let up = this._grid.getAdjacentCell(tile.cell,v2(0, +1));
            let down = this._grid.getAdjacentCell(tile.cell, v2(0, -1));
            let left = this._grid.getAdjacentCell(tile.cell, v2(-1, 0));
            let right = this._grid.getAdjacentCell(tile.cell, v2(+1, 0));

            if (up !== null && this._canMerge(tile, up.tile))
                return false;
            
            if (down !== null && this._canMerge(tile, down.tile))
                return false;

            if (left !== null && this._canMerge(tile, left.tile))
                return false;

            if (right !== null && this._canMerge(tile, right.tile))
                return false;
        }

        return true;
    }
}


