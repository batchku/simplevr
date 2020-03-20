import { AssetInteractor } from 'core/asset/assetInteractor';
import { BaseElement } from 'data/scene/entities/baseElement';
import * as THREE from 'three';
import { THREE_CONST } from '../../../common/constants';
import { car2pol, getCoordinatePosition, pol2car } from '../../util/iconPositionUtil';
import { RoomPropertyTypeService } from '../../util/roomPropertyTypeService';
import fontHelper from '../modules/fontHelper';

const TWEEN = require('@tweenjs/tween.js');


export default class BasePlane {
  static SCALE: number = 0.001;

  private _tweenActivate;
  private _tweenDeactivate;
  private _activating: boolean = false;

  protected _hasPlaneMesh: boolean = false;
  protected _delayBeforeRunActivation = 0;

  protected _tweenIconActivate;
  protected _tweenIconDeactivate;

  protected _tweenPreviewIconIn;
  protected _tweenPreviewIconOut;
  protected _tweenIconIn;
  protected _tweenIconOut;

  protected prop: BaseElement;
  protected camera: THREE.PerspectiveCamera;
  protected assetInteractor: AssetInteractor;

  protected hoverIconGeometry(): any {
    return new THREE.CircleGeometry(THREE_CONST.HOTSPOT_DIM, THREE_CONST.DASHCIRCLE_SEG);
  }

  protected hoverIconTexture() {
    return this.assetInteractor.getTextureById('hotspot-hover');
  }

  public uuid: string;
  public type: string;
  public planeMesh: THREE.Mesh;
  public iconMesh: THREE.Mesh;
  public previewIconMesh: THREE.Mesh;
  public labelMesh: THREE.Mesh;
  public cancelAnimation: Function;

  public get hasPlaneMesh(): boolean {
    return this._hasPlaneMesh;
  }

  constructor(roomProperty: any, camera: THREE.PerspectiveCamera, assetInteractor: AssetInteractor) {
    this.prop = roomProperty;
    this.type = RoomPropertyTypeService.getTypeString(this.prop);
    this.camera = camera;
    this.assetInteractor = assetInteractor;
    this.cancelAnimation = () => {};

    this._renderIconsAndLabel();
    this.uuid = this.iconMesh.uuid;
  }

  private _renderIconsAndLabel() {
    const location = this.prop.getLocation();
    const position = getCoordinatePosition(location.getX(), location.getY());
    const polPol = car2pol(position.x, position.y, position.z);
    const posCar = pol2car(THREE_CONST.CAMERA_HOTSPOT, polPol.y, polPol.z);

    // Render iconMesh
    const iconGeometry = this.hoverIconGeometry();
    const iconTexture = this.hoverIconTexture();
    const iconMaterial = new THREE.MeshBasicMaterial({
      map: iconTexture,
      transparent: true,
      side: THREE.FrontSide,
    });

    this.iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
    this.iconMesh.position.set(posCar.x, posCar.y, posCar.z);
    this.iconMesh.lookAt(this.camera.position);
    this.iconMesh.material['opacity'] = 0;

    // render previewIconMesh
    const previewIconGeometry = new THREE.CircleGeometry(2 * THREE_CONST.HOTSPOT_DIM, THREE_CONST.DASHCIRCLE_SEG);
    const iconPreviewTexture = this.assetInteractor.getTextureById('hotspot-default');
    const iconPreviewMaterial = new THREE.MeshBasicMaterial({
      map: iconPreviewTexture,
      transparent: true,
      side: THREE.FrontSide,
    });

    this.previewIconMesh = new THREE.Mesh(previewIconGeometry, iconPreviewMaterial);
    this.previewIconMesh.position.set(position.x, position.y, position.z);
    this.previewIconMesh.lookAt(this.camera.position);
    this.previewIconMesh.visible = true;

    // render labelMesh
    const fontProperties = {
      font: fontHelper.getBaseFont(),
      size: THREE_CONST.FONT_HOTSPOT_SIZE,
      height: THREE_CONST.FONT_HOTSPOT_HEIGHT,
      curveSegments: 12,
      bevelEnabled: false,
      bevelThickness: 4,
      bevelSize: 8,
      bevelSegments: 5,
    };
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const labelGeometry = new THREE.TextGeometry(this.prop.getName(), fontProperties);

    labelGeometry.computeBoundingBox();
    labelGeometry.computeVertexNormals();
    labelGeometry.center();

    this.labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    this.labelMesh.position.set(position.x, position.y - 40, position.z);
    this.labelMesh.lookAt(this.camera.position);
    this.labelMesh.visible = false;
  }

  private _animateActivate() {
    const duration = this.get_activate_duration(THREE_CONST.TWEEN_PLANE_IN);

    return new Promise((resolve) => {
      if (this.hasPlaneMesh) {
        this.planeMesh.visible = true;
        this._tweenActivate = new TWEEN.Tween(this.planeMesh.scale)
          .to({
            x: THREE_CONST.TWEEN_PLANE_SCALE,
            y: THREE_CONST.TWEEN_PLANE_SCALE,
            z: 1,
          }, duration)
          .easing(TWEEN.Easing.Linear.None)
          .onComplete(() => {
            TWEEN.remove(this._tweenActivate);
            resolve();
          })
          .start();
      } else {
        resolve();
      }
    });
  }

  private _animateDeactivate(duration = THREE_CONST.TWEEN_PLANE_OUT) {
    return new Promise((resolve) => {
      if (this.hasPlaneMesh) {
        this._tweenDeactivate = new TWEEN.Tween(this.planeMesh.scale)
          .to({ x: .001, y: .001, z: 1 }, duration)
          .easing(TWEEN.Easing.Linear.None)
          .onComplete(() => {
            TWEEN.remove(this._tweenDeactivate);
            this.planeMesh.visible = false;
            resolve();
          })
          .start();
      } else {
        resolve();
      }
    });
  }

  protected _animateIconActivate(duration = this.get_activate_duration(THREE_CONST.TWEEN_ICON_OUT)) {
    return new Promise((resolve) => {
      this.labelMesh.visible = false;
      this._tweenIconActivate = new TWEEN.Tween(this.iconMesh.material)
        .to({ opacity: 0 }, duration)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(() => {
          TWEEN.remove(this._tweenIconActivate);
          this.iconMesh.visible = false;

          resolve();
        })
        .start();
    });
  }

  protected get_activate_duration(defaultDuration): number {
    return defaultDuration;
  }

  protected _animateIconDeactivate(duration = THREE_CONST.TWEEN_ICON_IN) {
    return new Promise((resolve) => {
      this.iconMesh.visible = true;
      this.labelMesh.visible = true;

      this._tweenIconDeactivate = new TWEEN.Tween(this.iconMesh.material)
        .to({ opacity: 1 }, duration)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(() => {
          TWEEN.remove(this._tweenIconDeactivate);
          resolve();
        })
        .start();
    });
  }

  protected _render(): any {
    return null;
  }

  public onActivated() {
  }

  public onDeactivated() {
  }

  public render(): THREE.Mesh {
    this.planeMesh = this._render();

    return this.planeMesh;
  }

  public update() {
  }

  public dispose(scene: THREE.Scene) {
    const mesh = this.planeMesh;

    if (mesh) {
      if (mesh.material) {
        mesh.material['map'] && mesh.material['map'].dispose();
        mesh.material['dispose'] && mesh.material['dispose']();
      }

      scene.remove(mesh);
    }

    // Remove Preview Icon mesh
    this.previewIconMesh.children.forEach((child) => {
      if (child['material']) {
        child['material'].dispose();
      }
      if (child['geometry']) {
        child['geometry'].dispose();
      }
      scene.remove(child);
    });

    scene.remove(this.previewIconMesh);

    // Remove Icon mesh
    this.iconMesh.material['map'] && this.iconMesh.material['map'].dispose();
    this.iconMesh.material['dispose'] && this.iconMesh.material['dispose']();
    this.iconMesh.geometry.dispose();
    scene.remove(this.iconMesh);

    // Remove Label mesh
    this.labelMesh.material['dispose'] && this.labelMesh.material['dispose']();
    this.labelMesh.geometry.dispose();
    this.labelMesh.geometry = undefined;
    scene.remove(this.labelMesh);
  }

  public activate() {
    this._activating = true;

    return new Promise((resolve) => {
      setTimeout(resolve, this._delayBeforeRunActivation);
    }).then(() => {
      if (this._activating) {
        return Promise.all([
          this._animateActivate(),
          this._animateIconActivate(),

          this.setCancelAnimation(() => {
            this._tweenActivate && this._tweenActivate.stop();
            this._tweenActivate = null;
            this._tweenIconActivate && this._tweenIconActivate.stop();
            this._tweenIconActivate = null;
          })
        ]).then(() => {

          if (this._activating) {
            this.onActivated();
          }

          return this._activating;
        });
      }

      return this._activating;
    });
  }

  public deactivate(onlyPlaneAnimation: boolean = false, duration = THREE_CONST.TWEEN_PLANE_OUT, iconDuration = THREE_CONST.TWEEN_ICON_IN) {
    const promises = [this._animateDeactivate(duration)];

    this._activating = false;

    if (!onlyPlaneAnimation) {
      promises.push(this._animateIconDeactivate(iconDuration));
    }

    this.setCancelAnimation(() => {
      if (!onlyPlaneAnimation) {
        this._tweenIconDeactivate && this._tweenIconDeactivate.stop();
        this._tweenIconDeactivate = null;
      }
    });

    return Promise.all(promises).then(() => {
      this.onDeactivated();
    });
  }

  public hoverOut(inDuration = THREE_CONST.TWEEN_ICON_IN, outDuration = THREE_CONST.TWEEN_ICON_OUT) {
    return new Promise((resolve) => {
      this.cancelAnimation();
      this.labelMesh.visible = false;
      this.previewIconMesh.visible = true;
      this._tweenPreviewIconIn = new TWEEN.Tween(this.previewIconMesh.scale);
      this._tweenIconOut = new TWEEN.Tween(this.iconMesh.material);

      this.setCancelAnimation(() => {
        this._tweenPreviewIconIn && this._tweenPreviewIconIn.stop();
        this._tweenPreviewIconIn = null;

        this._tweenIconOut && this._tweenIconOut.stop();
        this._tweenIconOut = null;
      });

      const previewPromise = new Promise((resolve) => {
        this._tweenPreviewIconIn
          .to({
            x: 1,
            y: 1,
            z: 1,
          }, inDuration)
          .easing(TWEEN.Easing.Linear.None)
          .onComplete(() => {
            TWEEN.remove(this._tweenPreviewIconIn);
            resolve();
          })
          .start();
      });

      const iconPromise = new Promise((resolve) => {
        this._tweenIconOut
          .to({
            opacity: 0,
          }, outDuration)
          .easing(TWEEN.Easing.Linear.None)
          .onComplete(() => {
            this.iconMesh.visible = false;
            TWEEN.remove(this._tweenIconOut);
            resolve();
          })
          .start();
      });

      return Promise.all([previewPromise, iconPromise]).then(() => {
        this.setCancelAnimation(() => {});
        return resolve();
      });
    });
  }

  public hoverIn(outDuration = THREE_CONST.TWEEN_ICON_OUT, inDuration = THREE_CONST.TWEEN_ICON_IN) {
    return new Promise((resolve) => {
      this.cancelAnimation();
      this._tweenPreviewIconOut = new TWEEN.Tween(this.previewIconMesh.scale);
      this._tweenIconIn = new TWEEN.Tween(this.iconMesh.material);

      this.setCancelAnimation(() => {
        this._tweenPreviewIconOut && this._tweenPreviewIconOut.stop();
        this._tweenPreviewIconOut = null;

        this._tweenIconIn && this._tweenIconIn.stop();
        this._tweenIconIn = null;
      });

      const previewPromise = new Promise((resolve) => {
        this._tweenPreviewIconOut
          .to({
            x: 0.001,
            y: 0.001,
            z: 0.001,
          }, outDuration)
          .easing(TWEEN.Easing.Linear.None)
          .onComplete(() => {
            this.previewIconMesh.visible = false;
            TWEEN.remove(this._tweenPreviewIconOut);
            resolve();
          })
          .start();
      });

      this.iconMesh.visible = true;
      this.labelMesh.visible = true;

      const iconPromise = new Promise((resolve) => {
        this._tweenIconIn
          .to({
            opacity: 1,
          }, inDuration)
          .easing(TWEEN.Easing.Linear.None)
          .onComplete(() => {
            TWEEN.remove(this._tweenIconIn);
            resolve();
          })
          .start();
      });

      Promise.all([previewPromise, iconPromise]).then(resolve);
    });
  }

  public hideDefault() {
    return this.hoverOut(0, 0).then(() => {
      this.previewIconMesh.visible = false;
    });
  }

  public hidePreview() {
    this.labelMesh.visible = false;
    return this.hoverIn(0, 0).then(() => {
      this.previewIconMesh.visible = false;
      this.iconMesh.visible = false;
      this.labelMesh.visible = false;
    });
  }

  public hideActivate() {
    this.cancelAnimation();

    return this.deactivate(true, 0)
      .then(() => {
        this.previewIconMesh.visible = false;
        this.iconMesh.visible = false;
        this.labelMesh.visible = false;
      });
  }

  public showDefault() {
    return this.hoverOut().then(() => {
      this.previewIconMesh.visible = true;
    });
  }

  public showPreview() {
    return this.hoverIn(0, 0);
  }

  public showActivate() {
    return this.hoverIn(0, 0)
      .then(() => {
        this.activate();
      });
  }

  public setCancelAnimation(handler) {
    this.cancelAnimation = handler;
  }

  public resetActivateAnimation() {
    if (this._tweenActivate) {
      this._tweenActivate.stop();
      this._tweenActivate = null;
    }
  }

  public resetDeactivateAnimation() {
    if (this._tweenDeactivate) {
      this._tweenDeactivate.stop();
      this._tweenDeactivate = null;
    }
  }

  public resetIconInAnimations() {
    if (this._tweenPreviewIconOut) {
      this._tweenPreviewIconOut.stop();
      this._tweenPreviewIconOut = null;
    }
    if (this._tweenIconIn) {
      this._tweenIconIn.stop();
      this._tweenIconIn = null;
    }
  }

  public resetIconOutAnimations() {
    if (this._tweenPreviewIconIn) {
      this._tweenPreviewIconIn.stop();
      this._tweenPreviewIconIn = null;
    }
    if (this._tweenIconOut) {
      this._tweenIconOut.stop();
      this._tweenIconOut = null;
    }
  }
}
