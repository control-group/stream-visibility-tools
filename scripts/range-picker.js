/**
 * Enhanced range input functionality
 * Replaces standard range inputs with a combination of range and number inputs
 */

export function setupRangePickers() {
    // Setup hook for when settings are rendered
    Hooks.on('renderSettingsConfig', (app, html) => {
      // Find all range inputs in our module settings
      const rangeInputs = html.find('input[type="range"][name^="stream-visibility-tools."]');
      
      rangeInputs.each(function() {
        const $rangeInput = $(this);
        const $valueSpan = $rangeInput.next('.range-value');
        
        if (!$valueSpan.length) return;
        
        // Get the parent container
        const $formFields = $rangeInput.closest('.form-fields');
        
        // Store original attributes we need
        const settingName = $rangeInput.attr('name');
        const min = $rangeInput.attr('min');
        const max = $rangeInput.attr('max');
        const step = $rangeInput.attr('step');
        const value = $rangeInput.val();
        
        // Create our custom range-picker element
        const $rangePicker = $('<div class="custom-range-picker"></div>');
        
        // Create a number input
        const $numberInput = $('<input type="number">');
        $numberInput.attr({
          min: min,
          max: max,
          step: step,
          value: value,
          'data-dtype': 'Number'
        });
        
        // Important: Keep the original range input but update its styles
        $rangeInput.css('flex', '1');
        $rangeInput.css('margin-right', '10px');
        
        // Modify the DOM structure
        $valueSpan.remove(); // Remove the non-editable span
        $formFields.empty(); // Clear the form fields
        
        // Add our elements to the DOM
        $rangePicker.append($rangeInput).append($numberInput);
        $formFields.append($rangePicker);
        
        // Sync the range input to the number input
        $rangeInput.on('input', function() {
          $numberInput.val($(this).val());
        });
        
        // Sync the number input to the range input
        $numberInput.on('change', function() {
          const newValue = $(this).val();
          $rangeInput.val(newValue);
          
          // Trigger the change event on the original input to save the setting
          $rangeInput.trigger('change');
        });
      });
    });
  }

  // Add CSS to style our custom elements
  function addRangePickerStyles() {
    const styles = `
      .custom-range-picker {
        display: flex;
        align-items: center;
        width: 100%;
      }
      
      .custom-range-picker input[type="range"] {
        flex: 1;
        margin-right: 10px;
      }
      
      .custom-range-picker input[type="number"] {
        width: 5em;
        background-color: rgba(0, 0, 0, 0.05);
        border: 1px solid #7a7971;
        border-radius: 3px;
        padding: 2px 4px;
        text-align: right;
      }
      
      .custom-range-picker input[type="number"]:hover {
        border-color: #782e22;
      }
      
      .custom-range-picker input[type="number"]:focus {
        background-color: #fff;
        border-color: #782e22;
        outline: none;
        box-shadow: 0 0 3px rgba(120, 46, 34, 0.5);
      }
    `;
    
    // Add the styles to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
  
  // Initialize everything
  export function initializeRangePickers() {
    addRangePickerStyles();
    setupRangePickers();
  }