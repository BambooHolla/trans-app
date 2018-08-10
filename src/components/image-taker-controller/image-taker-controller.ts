import { Injectable } from "@angular/core";
import { App, Config } from "ionic-angular";

// import { ActionSheetController, ModalController } from 'ionic-angular';

// import { ImagePicker } from '@ionic-native/image-picker';

// import { CameraModal } from '../../modals/camera/camera';
// import { ImagePickerService } from '../../providers/image-picker-service';
import { ImageTaker } from "./image-taker";

@Injectable()
export class ImageTakerController {
    constructor(
        // private cameraModal: CameraModal,
        // private imagePickerService: ImagePickerService,
        // private actionsheetCtrl: ActionSheetController,
        // private modalCtrl: ModalController,
        private _app: App,
        public config: Config,
    ) {}

    create(name: string, maxCount: number = 1): ImageTaker {
        return new ImageTaker(this._app, { name, maxCount });
    }
}
