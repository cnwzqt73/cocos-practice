import { _decorator, Color, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('TileState')
export class TileState extends Component {
    
    @property(Color)
    public backgroundColor: Color = new Color();
    @property(Color)
    public textColor: Color = new Color();

    public equals(other: TileState): boolean {
        return this.backgroundColor.equals(other.backgroundColor) && this.textColor.equals(other.textColor);
    }
}


