// Smooth scrolling for Anchor Links
function scrollToOnboarding() {
    document.getElementById('app-onboarding').scrollIntoView({
        behavior: 'smooth'
    });
}

// OS-specific dApp Links
document.addEventListener('DOMContentLoaded', function () {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);

    const dappLinks = document.querySelectorAll('.dynamic-dapp-link');
    const androidUrl = "https://play.google.com/store/search?q=aidav2&c=apps";
    const iosUrl = "https://testflight.apple.com/join/9d5vabsq";

    dappLinks.forEach(link => {
        if (isIOS) {
            link.href = iosUrl;
        } else if (isAndroid) {
            link.href = androidUrl;
        } else {
            // Default to onboarding section if on desktop
            link.href = "#app-onboarding";
            link.addEventListener('click', function (e) {
                // If the link is internally pointing, use smooth scroll
                if (this.getAttribute('href') === '#app-onboarding') {
                    e.preventDefault();
                    scrollToOnboarding();
                }
            });
        }
    });
});

// Copy Invite Code functionality
function copyInviteCode(elementId = 'inviteCode') {
    const inviteCode = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(inviteCode).then(() => {
        // Handle all copy buttons simultaneously for better feedback
        const copyBtns = document.querySelectorAll('.key-copy-btn');
        copyBtns.forEach(copyBtn => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="trust-icon"><path d="M20 6L9 17l-5-5" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
            }, 2000);
        });
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Intersection Observer for slow, luxurious reveal animations
document.addEventListener('DOMContentLoaded', () => {
    // Sticky Header Scroll State
    const header = document.querySelector('.sticky-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Select elements to reveal
    const reveals = document.querySelectorAll('.reveal, .bento-item, .section-header, .trust-bar, .hero-content, .accordion-item');

    // Add the reveal class to set initial state (if not already present)
    reveals.forEach(el => {
        if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
        }
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => {
        observer.observe(el);
    });

    // FAQ Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;

            // Toggle expanded class
            const isExpanded = item.classList.contains('expanded');

            // Close all others
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                otherItem.classList.remove('expanded');
                if (otherItem.querySelector('.accordion-content')) {
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            if (!isExpanded) {
                item.classList.add('expanded');
                // Calculate and apply the scrollHeight to fully expand vertically
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // OS Detection for iOS Testflight Link
    const iosBtn = document.querySelector('.btn-ios');
    if (iosBtn) {
        iosBtn.addEventListener('click', function (e) {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isIOS = /iphone|ipad|ipod/.test(userAgent) || (window.navigator.userAgent.match(/mac/) && window.navigator.maxTouchPoints > 2);

            if (!isIOS) {
                e.preventDefault(); // Prevent navigating to TestFlight
                alert("The iOS Beta (TestFlight) is only accessible from an iPhone or iPad. Please open this website on your Apple device to install.");
            }
        });
    }

    // Intel Dispatch Form Handling
    const intelForm = document.getElementById('intelForm');
    if (intelForm) {
        intelForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent actual form submission

            const submitBtn = this.querySelector('button[type="submit"]');
            const successMsg = document.getElementById('intelSuccess');
            const formData = new FormData(intelForm);

            // Visual feedback
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.style.opacity = '0.7';
            submitBtn.disabled = true;

            fetch('https://formsubmit.co/ajax/defi.yield.desk@proton.me', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        intelForm.reset();
                        // Show success message
                        successMsg.style.display = 'block';
                        void successMsg.offsetWidth; // Trigger reflow
                        successMsg.style.opacity = '1';

                        // Hide after 5 seconds
                        setTimeout(() => {
                            successMsg.style.opacity = '0';
                            setTimeout(() => {
                                if (successMsg.style.opacity === '0') {
                                    successMsg.style.display = 'none';
                                }
                            }, 500);
                        }, 5000);
                    } else {
                        alert("Submission failed. Please try again.");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("An error occurred. Please check your connection.");
                })
                .finally(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.style.opacity = '1';
                    submitBtn.disabled = false;
                });
        });
    }
});

// VIP Support Widget Logic
document.addEventListener('DOMContentLoaded', () => {
    const supportBtn = document.getElementById('supportBtn');
    const supportModal = document.getElementById('supportModal');
    const closeSupport = document.getElementById('closeSupport');
    const supportForm = document.getElementById('supportForm');
    const supportFormContainer = document.getElementById('supportFormContainer');
    const supportSuccess = document.getElementById('supportSuccess');

    if (supportBtn && supportModal) {
        supportBtn.addEventListener('click', () => {
            supportModal.classList.toggle('hidden');
        });

        closeSupport.addEventListener('click', () => {
            supportModal.classList.add('hidden');
        });

        // Close when clicking outside
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

            fetch('https://formsubmit.co/ajax/defi.yield.desk@proton.me', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
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
                .catch(error => {
                    console.error('Error:', error);
                    alert("Security handshake failed. Please check your connection.");
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});
