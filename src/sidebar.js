document.addEventListener('DOMContentLoaded', function() {
  const selectAllBtn = document.getElementById('selectAll');
  const openTabsBtn = document.getElementById('openTabs');
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const locationSelect = document.getElementById('location');
  const jobSearchInput = document.getElementById('jobSearch');

  // Company career page URLs
  const companyUrls = {
    macquarie: 'https://recruitment.macquarie.com/en_US/careers/SearchJobs',
    westpac: 'https://ebuu.fa.ap1.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX/jobs',
    atlassian: 'https://www.atlassian.com/company/careers/all-jobs',
    canva: 'https://www.lifeatcanva.com/en/jobs/'
  };

  // Update button states
  function updateButtonStates() {
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const allChecked = checkboxes.length === checkedBoxes.length;
    
    selectAllBtn.textContent = allChecked ? 'Deselect All' : 'Select All';
    openTabsBtn.disabled = checkedBoxes.length === 0;
  }

  // Select/Deselect all functionality
  selectAllBtn.addEventListener('click', function() {
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const shouldCheck = checkedBoxes.length !== checkboxes.length;
    
    checkboxes.forEach(checkbox => {
      checkbox.checked = shouldCheck;
    });
    
    updateButtonStates();
  });

  // Update button states when checkboxes change
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateButtonStates);
  });

  // Open career pages functionality
  openTabsBtn.addEventListener('click', function() {
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const location = locationSelect.value;
    const jobSearch = jobSearchInput.value.trim();
    
    checkedBoxes.forEach(checkbox => {
      const company = checkbox.value;
      let url = companyUrls[company];
      
      // Add location and job search parameters where applicable
      if (company === 'macquarie' && (location || jobSearch)) {
        if (jobSearch) {
          url += '/' + encodeURIComponent(jobSearch);
        }
        if (location === 'sydney') {
          url += '?592=%5B887281%5D';
        }
      } else if (company === 'westpac' && (location || jobSearch)) {
        const params = new URLSearchParams();
        if (jobSearch) params.append('keyword', jobSearch);
        if (location === 'sydney') {
          params.append('location', 'Sydney, NSW, Australia');
          params.append('locationId', '300000001734632');
          params.append('locationLevel', 'city');
          params.append('mode', 'location');
          params.append('radius', '25');
          params.append('radiusUnit', 'MI');
        }
        url += '?' + params.toString();
      } else if (company === 'canva' && (location || jobSearch)) {
        const params = new URLSearchParams();
        if (jobSearch) params.append('search', jobSearch);
        if (location === 'sydney') params.append('country', 'Australia');
        params.append('pagesize', '20');
        url += '?' + params.toString() + '#results';
      } else if (company === 'atlassian' && (location || jobSearch)) {
        const params = new URLSearchParams();
        params.append('team', '');
        if (location === 'sydney') params.append('location', 'Australia');
        if (jobSearch) params.append('search', jobSearch);
        url += '?' + params.toString();
      }
      
      // Open tab
      chrome.tabs.create({ url: url });
    });
    
    // Don't close sidebar - keep it open for multiple uses
    // Optionally show a brief success message
    const originalText = openTabsBtn.textContent;
    openTabsBtn.textContent = 'Opened!';
    openTabsBtn.disabled = true;
    
    setTimeout(() => {
      openTabsBtn.textContent = originalText;
      updateButtonStates();
    }, 1500);
  });

  // Initialize button states
  updateButtonStates();

  // Save and restore form state
  function saveState() {
    const state = {
      selectedCompanies: Array.from(checkboxes).map(cb => ({ id: cb.id, checked: cb.checked })),
      location: locationSelect.value,
      jobSearch: jobSearchInput.value
    };
    chrome.storage.local.set({ unicornCareersState: state });
  }

  function restoreState() {
    chrome.storage.local.get(['unicornCareersState'], function(result) {
      if (result.unicornCareersState) {
        const state = result.unicornCareersState;
        
        // Restore checkboxes
        state.selectedCompanies.forEach(company => {
          const checkbox = document.getElementById(company.id);
          if (checkbox) checkbox.checked = company.checked;
        });
        
        // Restore other inputs
        if (state.location) locationSelect.value = state.location;
        if (state.jobSearch) jobSearchInput.value = state.jobSearch;
        
        updateButtonStates();
      }
    });
  }

  // Save state when form changes
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', saveState);
  });
  locationSelect.addEventListener('change', saveState);
  jobSearchInput.addEventListener('input', saveState);

  // Restore state on load
  restoreState();
});