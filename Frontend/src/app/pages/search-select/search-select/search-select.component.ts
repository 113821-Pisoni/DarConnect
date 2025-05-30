// search-select.component.ts
import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, HostListener, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchSelectOption {
  id: string | number;
  label: string;
  subtitle?: string; // Para mostrar info adicional como DNI, etc.
}

@Component({
  selector: 'app-search-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-select.component.html',
  styleUrl: './search-select.component.css'
})
export class SearchSelectComponent implements OnInit, OnChanges {
  @Input() label: string = '';
  @Input() placeholder: string = 'Buscar...';
  @Input() options: SearchSelectOption[] = [];
  @Input() selectedValue: string | number = '';
  @Input() clearable: boolean = true;
  
  @Output() selectionChange = new EventEmitter<string | number>();
  
  @ViewChild('container') containerRef!: ElementRef;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  searchTerm: string = '';
  filteredOptions: SearchSelectOption[] = [];
  selectedItem: SearchSelectOption | null = null;
  isDropdownOpen: boolean = false;
  highlightedIndex: number = -1;

  ngOnInit(): void {
    this.filteredOptions = [...this.options];
    this.updateSelectedItem();
  }

  ngOnChanges(): void {
    this.updateSelectedItem();
    this.filterOptions();
  }

  private updateSelectedItem(): void {
    this.selectedItem = this.options.find(option => 
      option.id === this.selectedValue
    ) || null;
    
    // Si hay un item seleccionado y no está abierto el dropdown, mostrar su label
    if (this.selectedItem && !this.isDropdownOpen) {
      this.searchTerm = this.selectedItem.label;
    } else if (!this.selectedItem) {
      this.searchTerm = '';
    }
  }

  onSearchChange(): void {
    this.filterOptions();
    this.highlightedIndex = -1;
    if (!this.isDropdownOpen) {
      this.showDropdown();
    }
    
    // Si está escribiendo diferente al item seleccionado, limpiar selección
    if (this.selectedItem && this.searchTerm !== this.selectedItem.label) {
      this.selectedItem = null;
      this.selectionChange.emit('');
    }
  }

  private filterOptions(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOptions = [...this.options];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredOptions = this.options.filter(option =>
        option.label.toLowerCase().includes(searchLower) ||
        (option.subtitle && option.subtitle.toLowerCase().includes(searchLower))
      );
    }
  }

  showDropdown(): void {
    this.isDropdownOpen = true;
    this.filterOptions();
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.isDropdownOpen = false;
      this.highlightedIndex = -1;
      
      // Si no hay selección válida, limpiar
      if (!this.selectedItem) {
        this.searchTerm = '';
      } else {
        // Restaurar el texto del item seleccionado
        this.searchTerm = this.selectedItem.label;
      }
    }, 150);
  }

  toggleDropdown(): void {
    if (this.isDropdownOpen) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  selectOption(option: SearchSelectOption): void {
    this.selectedValue = option.id;
    this.selectedItem = option;
    this.searchTerm = option.label;
    this.selectionChange.emit(option.id);
    this.hideDropdown();
    
    // Mantener foco
    setTimeout(() => {
      this.searchInputRef.nativeElement.focus();
    }, 100);
  }

  clearSelection(): void {
    if (!this.clearable) return;
    
    this.selectedValue = '';
    this.selectedItem = null;
    this.searchTerm = '';
    this.selectionChange.emit('');
    this.filterOptions();
    this.searchInputRef.nativeElement.focus();
  }

  isSelected(option: SearchSelectOption): boolean {
    return this.selectedValue === option.id;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isDropdownOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      this.showDropdown();
      event.preventDefault();
      return;
    }

    if (!this.isDropdownOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(
          this.highlightedIndex + 1, 
          this.filteredOptions.length - 1
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;
        
      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.containerRef.nativeElement.contains(event.target)) {
      this.hideDropdown();
    }
  }
}