import React from 'react'
import {
  DeviceEventEmitter,
  findNodeHandle,
  NativeModules,
  Platform,
  requireNativeComponent,
  ViewStyle } from 'react-native'

const RNPdfScanner = requireNativeComponent('RNPdfScanner')
const ScannerManager: any = NativeModules.RNPdfScannerManager

export interface PictureTaken {
  rectangleCoordinates?: object;
  croppedImage: string;
  initialImage: string;
  width: number;
  height: number;
}

/**
 * TODO: Change to something like this
interface PictureTaken {
  uri: string;
  base64?: string;
  width?: number; // modify to get it
  height?: number; // modify to get it
  rectangleCoordinates?: object;
  initial: {
    uri: string;
    base64?: string;
    width: number; // modify to get it
    height: number; // modify to get it
  };
}
 */

interface PdfScannerProps {
  onDocumentScannerTaken?: (event: any) => void;
  onRectangleDetect?: (event: any) => void;
  onProcessing?: () => void;
  quality?: number;
  overlayColor?: number | string;
  enableTorch?: boolean;
  useFrontCam?: boolean;
  saturation?: number;
  brightness?: number;
  contrast?: number;
  detectionCountBeforeCapture?: number;
  durationBetweenCaptures?: number;
  detectionRefreshRateInMS?: number;
  documentAnimation?: boolean;
  noGrayScale?: boolean;
  manualOnly?: boolean;
  style?: ViewStyle;
  useBase64?: boolean;
  saveInAppDocument?: boolean;
  captureMultiple?: boolean;
}

class PdfScanner extends React.Component<PdfScannerProps> {
  sendonDocumentScannerTakenEvent (event: any) {
    if (!this.props.onDocumentScannerTaken) return null
    return this.props.onDocumentScannerTaken(event.nativeEvent)
  }

  sendOnRectangleDetectEvent (event: any) {
    if (!this.props.onRectangleDetect) return null
    return this.props.onRectangleDetect(event.nativeEvent)
  }

  getImageQuality () {
    if (!this.props.quality) return 0.8
    if (this.props.quality > 1) return 1
    if (this.props.quality < 0.1) return 0.1
    return this.props.quality
  }

  componentDidMount () {
    if (Platform.OS === 'android') {
      const { onDocumentScannerTaken, onProcessing } = this.props
      if (onDocumentScannerTaken) DeviceEventEmitter.addListener('onDocumentScannerTaken', onDocumentScannerTaken)
      if (onProcessing) DeviceEventEmitter.addListener('onProcessingChange', onProcessing)
    }
  }

  componentDidUpdate (prevProps: PdfScannerProps) {
    if (Platform.OS === 'android') {
      if (this.props.onDocumentScannerTaken !== prevProps.onDocumentScannerTaken) {
        if (prevProps.onDocumentScannerTaken) { DeviceEventEmitter.removeListener('onDocumentScannerTaken', prevProps.onDocumentScannerTaken) }
        if (this.props.onDocumentScannerTaken) { DeviceEventEmitter.addListener('onDocumentScannerTaken', this.props.onDocumentScannerTaken) }
      }
      if (this.props.onProcessing !== prevProps.onProcessing) {
        if (prevProps.onProcessing) { DeviceEventEmitter.removeListener('onProcessingChange', prevProps.onProcessing) }
        if (this.props.onProcessing) { DeviceEventEmitter.addListener('onProcessingChange', this.props.onProcessing) }
      }
    }
  }

  componentWillUnmount () {
    if (Platform.OS === 'android') {
      const { onDocumentScannerTaken, onProcessing } = this.props
      if (onDocumentScannerTaken) DeviceEventEmitter.removeListener('onDocumentScannerTaken', onDocumentScannerTaken)
      if (onProcessing) DeviceEventEmitter.removeListener('onProcessingChange', onProcessing)
    }
  }

  capture () {
    if (this._scannerHandle) {
      ScannerManager.capture(this._scannerHandle)
    }
  }

  _scannerRef: any = null;
  _scannerHandle: number | null = null;
  _setReference = (ref: any) => {
    if (ref) {
      this._scannerRef = ref
      this._scannerHandle = findNodeHandle(ref)
    } else {
      this._scannerRef = null
      this._scannerHandle = null
    }
  };

  render () {
    return (
      <RNPdfScanner
        ref={this._setReference}
        {...this.props}
        onDocumentScannerTaken={this.sendonDocumentScannerTakenEvent.bind(this)}
        onRectangleDetect={this.sendOnRectangleDetectEvent.bind(this)}
        useFrontCam={this.props.useFrontCam || false}
        brightness={this.props.brightness || 0}
        saturation={this.props.saturation || 1}
        contrast={this.props.contrast || 1}
        quality={this.getImageQuality()}
        detectionCountBeforeCapture={this.props.detectionCountBeforeCapture || 5}
        durationBetweenCaptures={this.props.durationBetweenCaptures || 0}
        detectionRefreshRateInMS={this.props.detectionRefreshRateInMS || 50}
      />
    )
  }
}

export default PdfScanner
