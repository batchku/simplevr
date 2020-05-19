// Angular Modules
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
// UI components
import { Checkbox } from 'ui/common/checkbox/checkbox';
// Services
import { LoadingModal } from 'ui/common/modal/loading-modal/loading-modal';
import { MessageModal } from 'ui/common/modal/message-modal/message-modal';
// Modal
import { Modal } from 'ui/common/modal/modal';
import { ShareableModal } from 'ui/common/modal/shareable-modal/shareable-modal';
import { TextInputMaterial } from 'ui/common/text-input-material/text-input-material';
import { TextInput } from 'ui/common/text-input/text-input';
import { PlayStoryModal } from 'ui/common/modal/play-story-modal/play-story-modal';

@NgModule({
  declarations: [
    Checkbox,
    TextInput,
    TextInputMaterial,
    Modal,
    LoadingModal,
    MessageModal,
    ShareableModal,
    PlayStoryModal,
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  exports: [
    Checkbox,
    TextInput,
    TextInputMaterial,
    Modal,
    LoadingModal,
    MessageModal,
    ShareableModal,
    PlayStoryModal,
  ],
  providers: [
  ],
})
export class CommonModule {
}
