// Global dropdown manager to ensure only one dropdown is open at a time
type DropdownCloseCallback = () => void;

class DropdownManager {
  private activeDropdownId: string | null = null;
  private closeCallback: DropdownCloseCallback | null = null;

  openDropdown(id: string, closeCallback: DropdownCloseCallback): void {
    // Close any existing dropdown
    if (this.activeDropdownId && this.closeCallback) {
      this.closeCallback();
    }
    
    this.activeDropdownId = id;
    this.closeCallback = closeCallback;
  }

  closeDropdown(id: string): void {
    if (this.activeDropdownId === id) {
      this.activeDropdownId = null;
      this.closeCallback = null;
    }
  }

  closeAll(): void {
    if (this.closeCallback) {
      this.closeCallback();
    }
    this.activeDropdownId = null;
    this.closeCallback = null;
  }

  isActive(id: string): boolean {
    return this.activeDropdownId === id;
  }
}

export const dropdownManager = new DropdownManager();