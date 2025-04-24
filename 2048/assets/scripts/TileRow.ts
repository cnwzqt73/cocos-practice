import { _decorator, Component, Node } from 'cc';
import { TileCell } from './TileCell';

const { ccclass, property } = _decorator;

@ccclass('TileRow')
export class TileRow extends Component {
    
    public cells: TileCell[] = null;

    protected onLoad(): void {
        this.cells = this.getComponentsInChildren(TileCell);
    }
}


