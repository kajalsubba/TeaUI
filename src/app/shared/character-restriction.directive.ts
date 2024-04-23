import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCharacterRestriction]'
})
export class CharacterRestrictionDirective {

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const inputText = event.target.value;
    const sanitizedText = inputText.replace(/[^0-9]/g, ''); // Allow only digits

    // Update the input value with sanitized text
    this.renderer.setProperty(this.el.nativeElement, 'value', sanitizedText);
  }

}
