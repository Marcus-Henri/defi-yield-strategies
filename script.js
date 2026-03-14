// Smooth scrolling
function scrollToOnboarding() {
    const target = document.getElementById('app-onboarding');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
}

// Switch to a tab by hash
function switchToTab(hash) {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    if (!hash || hash === '#') hash = '#overview';
    const targetId = 'tab-' + hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        contents.forEach(c => c.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        targetElement.classList.add('active');
        const activeTab = document.querySelector(`.nav-tab[href="${hash}"]`);
        if (activeTab) activeTab.classList.add('active');
        const navTabs = document.getElementById('navTabs');
        if (navTabs) navTabs.classList.remove('open');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, null, hash);
    }
}

// OS-specific dApp Links
document.addEventListener('DOMContentLoaded', function () {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    const dappLinks = document.querySelectorAll('.dynamic-dapp-link');
    const androidUrl = "https://play.google.com/store/search?q=aidav2&c=apps";
    const iosUrl = "https://testflight.apple.com/join/9d5vabsq";

    dappLinks.forEach(link => {
        if (isIOS) { link.href = iosUrl; }
        else if (isAndroid) { link.href = androidUrl; }
        else {
            link.href = "#app-onboarding";
            link.addEventListener('click', function (e) {
                if (this.getAttribute('href') === '#app-onboarding') {
                    e.preventDefault();
                    scrollToOnboarding();
                }
            });
        }
    });

    // FIX: "Start Earning Daily" button → smooth scroll to #app-onboarding
    document.querySelectorAll('a.glass-button[href="#app-onboarding"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Switch to Get Started tab first if needed, then scroll
            const getStartedTab = document.getElementById('tab-getstarted');
            if (getStartedTab && !getStartedTab.classList.contains('active')) {
                switchToTab('#getstarted');
                setTimeout(() => scrollToOnboarding(), 400);
            } else {
                scrollToOnboarding();
            }
        });
    });

    // FIX: "Protocol Details" button → switch to Security tab
    document.querySelectorAll('a.glass-button[href="#architecture"], a[href="#architecture"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            switchToTab('#security');
        });
    });

    // Risk banner: update body offset dynamically if banner exists and is visible
    const riskBanner = document.getElementById('risk-banner');
    function updateBodyOffset() {
        if (riskBanner && riskBanner.style.display !== 'none') {
            const bannerH = riskBanner.offsetHeight;
            document.documentElement.style.setProperty('--risk-banner-height', bannerH + 'px');
        } else {
            document.documentElement.style.setProperty('--risk-banner-height', '0px');
        }
    }
    updateBodyOffset();

    // Watch for banner dismissal
    const dismissBtn = riskBanner ? riskBanner.querySelector('button') : null;
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            setTimeout(updateBodyOffset, 50);
        });
    }
});

// Copy Invite Code functionality
function copyInviteCode(elementId = 'inviteCode') {
    const el = document.getElementById(elementId);
    if (!el) return;
    const inviteCode = el.innerText;
    navigator.clipboard.writeText(inviteCode).then(() => {
        const copyBtns = document.querySelectorAll('.key-copy-btn');
        copyBtns.forEach(copyBtn => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="trust-icon"><path d="M20 6L9 17l-5-5" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 2000);
        });
    }).catch(err => console.error('Failed to copy:', err));
}

// Intersection Observer — reveal animations
document.addEventListener('DOMContentLoaded', () => {
    // Sticky header scroll state
    const header = document.querySelector('.sticky-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { header.classList.add('scrolled'); }
        else { header.classList.remove('scrolled'); }
    });

    const reveals = document.querySelectorAll('.reveal, .bento-item, .section-header, .trust-bar, .hero-content, .accordion-item');
    reveals.forEach(el => { if (!el.classList.contains('reveal')) el.classList.add('reveal'); });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); obs.unobserve(entry.target); }
        });
    }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));

    // FAQ Accordion
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isExpanded = item.classList.contains('expanded');
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('expanded');
                if (i.querySelector('.accordion-content')) i.querySelector('.accordion-content').style.maxHeight = null;
            });
            if (!isExpanded) {
                item.classList.add('expanded');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });

        // Keyboard support
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); header.click(); }
        });
    });

    // iOS detection for TestFlight
    const iosBtn = document.querySelector('.btn-ios');
    if (iosBtn) {
        iosBtn.addEventListener('click', function (e) {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isIOS = /iphone|ipad|ipod/.test(userAgent) || (navigator.userAgent.match(/mac/) && navigator.maxTouchPoints > 2);
            if (!isIOS) {
                e.preventDefault();
                alert("The iOS Beta (TestFlight) is only accessible from an iPhone or iPad. Please open this website on your Apple device.");
            }
        });
    }

    // Intel Dispatch Form
    const intelForm = document.getElementById('intelForm');
    if (intelForm) {
        intelForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const successMsg = document.getElementById('intelSuccess');
            const formData = new FormData(intelForm);
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.style.opacity = '0.7';
            submitBtn.disabled = true;

            fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        intelForm.reset();
                        successMsg.style.display = 'block';
                        void successMsg.offsetWidth;
                        successMsg.style.opacity = '1';
                        setTimeout(() => {
                            successMsg.style.opacity = '0';
                            setTimeout(() => { if (successMsg.style.opacity === '0') successMsg.style.display = 'none'; }, 500);
                        }, 5000);
                    } else { alert("Submission failed. Please try again."); }
                })
                .catch(() => alert("An error occurred. Please check your connection."))
                .finally(() => { submitBtn.textContent = originalBtnText; submitBtn.style.opacity = '1'; submitBtn.disabled = false; });
        });
    }

    // Tab switching with keyboard support
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.click(); }
        });
    });
});

// VIP Support Widget
document.addEventListener('DOMContentLoaded', () => {
    const supportBtn = document.getElementById('supportBtn');
    const supportModal = document.getElementById('supportModal');
    const closeSupport = document.getElementById('closeSupport');
    const supportForm = document.getElementById('supportForm');
    const supportFormContainer = document.getElementById('supportFormContainer');
    const supportSuccess = document.getElementById('supportSuccess');

    if (supportBtn && supportModal) {
        supportBtn.addEventListener('click', () => supportModal.classList.toggle('hidden'));
        closeSupport.addEventListener('click', () => supportModal.classList.add('hidden'));

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') supportModal.classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!supportBtn.contains(e.target) && !supportModal.contains(e.target)) {
                supportModal.classList.add('hidden');
            }
        });
    }

    if (supportForm) {
        supportForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = document.getElementById('supportSubmit');
            const originalBtnText = submitBtn.textContent;
            const formData = new FormData(supportForm);
            submitBtn.textContent = 'Securing Transmission...';
            submitBtn.disabled = true;

            fetch('https://formsubmit.co/ajax/defi.yield.desk@proton.me', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        supportFormContainer.classList.add('hidden');
                        supportSuccess.classList.remove('hidden');
                    } else {
                        alert("Transmission failed. Please try again.");
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(() => {
                    alert("Security handshake failed. Please check your connection.");
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});
