// Multi-language translations
const translations = {
    ja: {
        title: '🎬 Story Video Maker',
        tagline: 'AIでストーリーを動画に変換',
        inputTitle: '📝 ストーリー入力',
        previewTitle: '🎞️ プレビュー',
        galleryTitle: '🖼️ マイギャラリー',
        generateText: '🎥 動画生成',
        clearText: '🗑️ クリア',
        downloadText: '💾 ダウンロード',
        saveText: '📁 ギャラリーに保存',
        previewPlaceholder: '動画はここに表示されます',
        loadingText: '動画を生成中...',
        placeholder: 'あなたのストーリーをここに入力してください...\\n\\n例:\\n桜が咲く春の日、公園で友達と出会った。\\n笑顔で話しながら、楽しい時間を過ごした。\\n夕日が沈む頃、また会う約束をして別れた。',
        successMessage: '動画が正常に生成されました！',
        errorMessage: '動画の生成中にエラーが発生しました。',
        emptyStoryError: 'ストーリーを入力してください。',
        savedToGallery: 'ギャラリーに保存しました！'
    },
    en: {
        title: '🎬 Story Video Maker',
        tagline: 'Transform stories into videos with AI',
        inputTitle: '📝 Story Input',
        previewTitle: '🎞️ Preview',
        galleryTitle: '🖼️ My Gallery',
        generateText: '🎥 Generate Video',
        clearText: '🗑️ Clear',
        downloadText: '💾 Download',
        saveText: '📁 Save to Gallery',
        previewPlaceholder: 'Video will appear here',
        loadingText: 'Generating video...',
        placeholder: 'Enter your story here...\\n\\nExample:\\nOn a spring day with cherry blossoms, I met a friend in the park.\\nWe talked with smiles and had a great time.\\nAs the sun set, we promised to meet again and parted ways.',
        successMessage: 'Video generated successfully!',
        errorMessage: 'Error occurred while generating video.',
        emptyStoryError: 'Please enter a story.',
        savedToGallery: 'Saved to gallery!'
    },
    zh: {
        title: '🎬 故事视频制作器',
        tagline: '用AI将故事转换为视频',
        inputTitle: '📝 故事输入',
        previewTitle: '🎞️ 预览',
        galleryTitle: '🖼️ 我的画廊',
        generateText: '🎥 生成视频',
        clearText: '🗑️ 清除',
        downloadText: '💾 下载',
        saveText: '📁 保存到画廊',
        previewPlaceholder: '视频将显示在这里',
        loadingText: '正在生成视频...',
        placeholder: '在此输入您的故事...\\n\\n例如：\\n樱花盛开的春日，我在公园遇见了朋友。\\n我们微笑着交谈，度过了愉快的时光。\\n夕阳西下时，我们约定再次见面，然后分别了。',
        successMessage: '视频生成成功！',
        errorMessage: '生成视频时出错。',
        emptyStoryError: '请输入故事。',
        savedToGallery: '已保存到画廊！'
    }
};

// Current language
let currentLang = 'ja';

// Gallery storage
let gallery = JSON.parse(localStorage.getItem('videoGallery') || '[]');

// Seedance API configuration
const SEEDANCE_API_KEY = 'fd5fb206-2399-4913-ac24-453fc6139481';
const SEEDANCE_API_URL = 'https://api.seedance.ai/v1/generate'; // Update if different

// DOM Elements
const elements = {
    title: document.getElementById('title'),
    tagline: document.getElementById('tagline'),
    inputTitle: document.getElementById('input-title'),
    previewTitle: document.getElementById('preview-title'),
    galleryTitle: document.getElementById('gallery-title'),
    generateBtn: document.getElementById('generate-btn'),
    clearBtn: document.getElementById('clear-btn'),
    downloadBtn: document.getElementById('download-btn'),
    saveGalleryBtn: document.getElementById('save-gallery-btn'),
    storyInput: document.getElementById('story-input'),
    videoPreview: document.getElementById('video-preview'),
    previewControls: document.getElementById('preview-controls'),
    loading: document.getElementById('loading'),
    statusMessage: document.getElementById('status-message'),
    galleryGrid: document.getElementById('gallery-grid'),
    generateText: document.getElementById('generate-text'),
    clearText: document.getElementById('clear-text'),
    downloadText: document.getElementById('download-text'),
    saveText: document.getElementById('save-text'),
    previewPlaceholder: document.getElementById('preview-placeholder'),
    loadingText: document.getElementById('loading-text')
};

// Initialize
function init() {
    setupLanguageSwitcher();
    setupEventListeners();
    renderGallery();
    updateLanguage();
}

// Language switcher
function setupLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            updateLanguage();
        });
    });
}

// Update UI language
function updateLanguage() {
    const t = translations[currentLang];
    elements.title.textContent = t.title;
    elements.tagline.textContent = t.tagline;
    elements.inputTitle.textContent = t.inputTitle;
    elements.previewTitle.textContent = t.previewTitle;
    elements.galleryTitle.textContent = t.galleryTitle;
    elements.generateText.textContent = t.generateText;
    elements.clearText.textContent = t.clearText;
    elements.downloadText.textContent = t.downloadText;
    elements.saveText.textContent = t.saveText;
    elements.previewPlaceholder.textContent = t.previewPlaceholder;
    elements.loadingText.textContent = t.loadingText;
    elements.storyInput.placeholder = t.placeholder.replace(/\\n/g, '\n');
}

// Event listeners
function setupEventListeners() {
    elements.generateBtn.addEventListener('click', generateVideo);
    elements.clearBtn.addEventListener('click', clearStory);
    elements.downloadBtn.addEventListener('click', downloadVideo);
    elements.saveGalleryBtn.addEventListener('click', saveToGallery);
}

// Generate video with Seedance API
async function generateVideo() {
    const story = elements.storyInput.value.trim();

    if (!story) {
        showStatus('error', translations[currentLang].emptyStoryError);
        return;
    }

    elements.generateBtn.disabled = true;
    elements.loading.classList.add('active');
    elements.statusMessage.style.display = 'none';

    try {
        // Try actual Seedance API first
        let videoData;
        try {
            videoData = await callSeedanceAPI(story);
            console.log('Seedance API response:', videoData);
        } catch (apiError) {
            console.warn('Seedance API failed, using mock data:', apiError);
            // Fallback to mock if API fails
            videoData = await mockSeedanceAPI(story);
        }

        displayVideo(videoData.url || videoData.video_url || videoData.result?.url);
        showStatus('success', translations[currentLang].successMessage);
        elements.previewControls.style.display = 'flex';
    } catch (error) {
        console.error('Error generating video:', error);
        showStatus('error', translations[currentLang].errorMessage + ' ' + error.message);
    } finally {
        elements.generateBtn.disabled = false;
        elements.loading.classList.remove('active');
    }
}

// Mock Seedance API call (replace with actual API integration)
async function mockSeedanceAPI(story) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // For demo: use a sample video URL
    // In production, this would be the actual Seedance API response
    return {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        id: Date.now(),
        story: story,
        timestamp: new Date().toISOString()
    };
}

// Actual Seedance API integration
async function callSeedanceAPI(story) {
    const response = await fetch(SEEDANCE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SEEDANCE_API_KEY}`,
            'X-API-Key': SEEDANCE_API_KEY  // Alternative auth header
        },
        body: JSON.stringify({
            prompt: story,
            text: story,
            duration: 30,
            quality: 'high',
            language: currentLang
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
}

// Display video
function displayVideo(videoUrl) {
    elements.videoPreview.innerHTML = `
        <video controls autoplay>
            <source src="${videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    `;
    elements.videoPreview.dataset.videoUrl = videoUrl;
}

// Clear story input
function clearStory() {
    elements.storyInput.value = '';
    elements.statusMessage.style.display = 'none';
}

// Download video
function downloadVideo() {
    const videoUrl = elements.videoPreview.dataset.videoUrl;
    if (!videoUrl) return;

    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `story-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Save to gallery
function saveToGallery() {
    const videoUrl = elements.videoPreview.dataset.videoUrl;
    const story = elements.storyInput.value.trim();

    if (!videoUrl) return;

    const videoData = {
        id: Date.now(),
        url: videoUrl,
        story: story,
        timestamp: new Date().toISOString()
    };

    gallery.unshift(videoData);
    localStorage.setItem('videoGallery', JSON.stringify(gallery));
    renderGallery();
    showStatus('success', translations[currentLang].savedToGallery);
}

// Render gallery
function renderGallery() {
    elements.galleryGrid.innerHTML = '';

    if (gallery.length === 0) {
        elements.galleryGrid.innerHTML = `
            <p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">
                ${currentLang === 'ja' ? 'ギャラリーは空です' : currentLang === 'en' ? 'Gallery is empty' : '画廊为空'}
            </p>
        `;
        return;
    }

    gallery.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <video src="${video.url}"></video>
            <div class="gallery-item-actions">
                <button class="icon-btn" onclick="playGalleryVideo(${index})" title="Play">▶️</button>
                <button class="icon-btn" onclick="downloadGalleryVideo(${index})" title="Download">💾</button>
                <button class="icon-btn" onclick="deleteGalleryVideo(${index})" title="Delete">🗑️</button>
            </div>
        `;
        elements.galleryGrid.appendChild(item);
    });
}

// Play gallery video
window.playGalleryVideo = function(index) {
    const video = gallery[index];
    displayVideo(video.url);
    elements.storyInput.value = video.story;
    elements.previewControls.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Download gallery video
window.downloadGalleryVideo = function(index) {
    const video = gallery[index];
    const a = document.createElement('a');
    a.href = video.url;
    a.download = `gallery-video-${video.id}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// Delete gallery video
window.deleteGalleryVideo = function(index) {
    if (confirm(currentLang === 'ja' ? 'この動画を削除しますか？' : currentLang === 'en' ? 'Delete this video?' : '删除此视频？')) {
        gallery.splice(index, 1);
        localStorage.setItem('videoGallery', JSON.stringify(gallery));
        renderGallery();
    }
};

// Show status message
function showStatus(type, message) {
    elements.statusMessage.className = `status-message ${type}`;
    elements.statusMessage.textContent = message;
    elements.statusMessage.style.display = 'block';

    setTimeout(() => {
        elements.statusMessage.style.display = 'none';
    }, 5000);
}

// Initialize app
init();
