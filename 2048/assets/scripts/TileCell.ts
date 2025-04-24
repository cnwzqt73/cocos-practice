import { _decorator, Component, Node, Vec2 } from 'cc';
import { Tile } from './Tile';

const { ccclass, property } = _decorator;

@ccclass('TileCell')
export class TileCell extends Component {

    public coordinates: Vec2 = new Vec2();
    public tile: Tile = null;

    public get empty() { return this.tile === null; }
    public get occupied() { return this.tile !== null; }
}


