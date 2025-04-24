import { _decorator, Component, math, Node, Vec2 } from 'cc';
import { TileRow } from './TileRow';
import { TileCell } from './TileCell';

const { ccclass, property } = _decorator;

@ccclass('TileGrid')
export class TileGrid extends Component {

    public rows: TileRow[] = null;
    public cells: TileCell[] = null;

    public get size() { return this.cells.length; }
    public get height() { return this.rows.length; }
    public get width() { return this.size / this.height; }

    protected onLoad(): void {
        this.rows = this.getComponentsInChildren(TileRow);
        this.cells = this.getComponentsInChildren(TileCell);
    }

    protected start(): void {
        for (let y = 0; y < this.rows.length; y++) {
            for (let x = 0; x < this.rows[y].cells.length; x++) {
                this.rows[y].cells[x].coordinates = new Vec2(x, y);
            }
        }
    }

    public getCell(x: number, y: number): TileCell {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.rows[y].cells[x];
        } else {
            return null;
        }
    }


    // cell.coordinates 参考的是“原点在左上角，X 轴向右为正，Y 轴向下为正”的坐标系。
    // 也就是说 TileGrid 里左上角那个 TileCell 的坐标是（0，0），右下角那个 TileCell 的坐标是（3，3）。
    // direction 参考的是引擎用的笛卡尔右手坐标系：
    // https://docs.cocos.com/creator/3.8/manual/zh/concepts/scene/coord.html#%E4%B8%96%E7%95%8C%E5%9D%90%E6%A0%87%E7%B3%BB-world-coordinate
    // 因为 cell.coordinates 参考的坐标系的 Y 轴的方向与 direction 相反， 所以获取附近的 Tilecell 时，需要反向计算 Y 轴的值。
    public getAdjacentCell(cell: TileCell, direction: Vec2): TileCell {
        let coordinates = cell.coordinates.clone();
        coordinates.x += direction.x;
        coordinates.y -= direction.y;

        return this.getCell(coordinates.x, coordinates.y);
    }

    public getRandomEmptyCell(): TileCell {
        let index = math.randomRangeInt(0, this.cells.length);
        let startingIndex = index;

        while (this.cells[index].occupied) {
            index++;

            if (index >= this.cells.length) {
                index = 0;
            }

            if (index === startingIndex) {
                return null;
            }
        }

        return this.cells[index];
    }
}


