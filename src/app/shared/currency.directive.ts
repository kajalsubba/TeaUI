import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCurrencyNumber]'
})
export class CurrencyDirective {

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const inputText = event.target.value;

    // Remove any characters that are not digits or a decimal point
    let sanitizedText = inputText.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point is allowed
    const parts = sanitizedText.split('.');
    if (parts.length > 2) {
      sanitizedText = `${parts[0]}.${parts[1]}`;
    }

    // Restrict to two decimal places
    if (parts[1]?.length > 2) {
      sanitizedText = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }

    // Update the input value with sanitized text
    this.renderer.setProperty(this.el.nativeElement, 'value', sanitizedText);
  }
}
