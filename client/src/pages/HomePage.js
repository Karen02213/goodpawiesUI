import { useEffect, useState } from 'react';
import likeIcon from '../icons/like.svg';
import commentIcon from '../icons/comment.svg';
import shareIcon from '../icons/share.svg';
import upIcon from '../icons/up.svg';

// Random profile image generator
const getRandomProfileImage = () => {
  const imageTypes = [
    () => `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
    () => `https://picsum.photos/200/200?random=${Math.random()}`
  ];
  return imageTypes[Math.floor(Math.random() * imageTypes.length)]();
};

// HomePage component
function HomePage() {
  // State management
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('John Doe'); // Example username
  const [cookies, setCookies] = useState(document.cookie);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [profileImage, setProfileImage] = useState(getRandomProfileImage());
  const [userImages, setUserImages] = useState({});
  const [news, setNews] = useState([]);
  const [comments, setComments] = useState({}); // { postId: [comments] }
  const [showComments, setShowComments] = useState({}); // { postId: bool }
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showUp, setShowUp] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  // Simulate fetching news
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNews(prev => [
        ...prev,
        ...Array.from({ length: 10 }, (_, i) => ({
          id: prev.length + i + 1,
          user: 'User' + ((prev.length + i) % 5 + 1),
          text: `This is a sample post #${prev.length + i + 1}`,
          time: 'Just now',
          likes: Math.floor(Math.random() * 100),
          liked: false,
          userImage: getRandomProfileImage(),
          postImage: Math.random() > 0.5 ? `https://picsum.photos/800/600?random=${Math.random()}` : null, // 50% chance of having an image
        }))
      ]);
      setLoading(false);
    }, 1000);
  }, [page]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 && !loading
      ) {
        setPage(p => p + 1);
      }
      setShowUp(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  // Click outside handler for comments
  useEffect(() => {
    const handleClickOutside = (event) => {
      const commentSections = document.querySelectorAll('.comment-section');
      commentSections.forEach(section => {
        if (!section.contains(event.target) && !event.target.closest('.comment-trigger')) {
          const postId = section.getAttribute('data-postid');
          if (postId && showComments[postId]) {
            setShowComments(prev => ({
              ...prev,
              [postId]: false
            }));
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showComments]);

  // Handlers for like, comment, share
  const handleLike = postId => {
    setNews(news => news.map(post =>
      post.id === postId ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } : post
    ));
  };

  const handleComment = (postId, comment) => {
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }));
  };

  const handleShowComments = postId => {
    setShowComments(prev => {
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[postId] = !prev[postId];
      return newState;
    });
  };

  const handleShare = postId => {
    const url = window.location.origin + '/post/' + postId;
    if (navigator.share) {
      navigator.share({ title: 'Check this post', url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // Responsive styles
  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: 16,
    padding: 0,
    maxWidth: '100%',
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', position: 'relative' }}>
      {/* Navbar - bigger */}
      <nav className="navbar navbar-light bg-light mb-3" style={{ padding: '1.2rem 1.5rem', borderRadius: 0, minHeight: 70 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span className="navbar-brand" style={{ fontSize: 26, fontWeight: 600, flex: 1, textAlign: 'center' }}>{username}</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
            <img src={profileImage} alt="Profile" style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 0, display: 'block' }} />
          </div>
        </div>
      </nav>
      {/* Scrollable News Feed */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 8px' }}>
        {news.map(post => (
          <div key={post.id} className="card" style={cardStyle}>
            <div className="card-body d-flex align-items-start" style={{ padding: 12 }}>
              <img src={post.userImage} alt="User" style={{ width: 36, height: 36, borderRadius: '50%', marginRight: 10 }} />
              <div style={{ flex: 1 }}>
                <h6 className="card-title mb-1" style={{ fontSize: 16 }}>{post.user}</h6>
                <p className="card-text" style={{ marginBottom: 4, fontSize: 15 }}>{post.text}</p>
                {post.postImage && (
                  <div style={{ marginBottom: 8, marginTop: 8 }}>
                    <img 
                      src={post.postImage} 
                      alt="Post attachment" 
                      style={{ 
                        width: '100%', 
                        borderRadius: 8,
                        maxHeight: 400,
                        objectFit: 'cover'
                      }} 
                    />
                  </div>
                )}
                <small className="text-muted">{post.time}</small>
                <div className="d-flex mt-2" style={{ 
                  alignItems: 'center', 
                  width: '100%',
                  borderTop: '1px solid #eee',
                  paddingTop: 8,
                  marginTop: 12
                }}>
                  {/* Action buttons with equal spacing */}
                  <div style={{ 
                    display: 'flex', 
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {/* Likes - Left */}
                    <div style={{ 
                      width: '33%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '4px 0'
                    }} onClick={() => handleLike(post.id)}>
                      <img src={likeIcon} alt="Like" style={{ 
                        width: 18, 
                        height: 18, 
                        filter: post.liked ? 'drop-shadow(0 0 2px #0d6efd)' : 'none',
                        marginRight: 6
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: post.liked ? '#0d6efd' : '#666' }}>
                        {post.likes}
                      </span>
                    </div>

                    {/* Comments - Center */}
                    <div 
                      className="comment-trigger"
                      style={{ 
                        width: '33%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '4px 0'
                      }} 
                      onClick={() => handleShowComments(post.id)}
                    >
                      <img src={commentIcon} alt="Comment" style={{ 
                        width: 18, 
                        height: 18,
                        marginRight: 6
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#666' }}>
                        {(comments[post.id] || []).length}
                      </span>
                    </div>

                    {/* Share - Right */}
                    <div style={{ 
                      width: '33%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '4px 0'
                    }} onClick={() => handleShare(post.id)}>
                      <img src={shareIcon} alt="Share" style={{ 
                        width: 18, 
                        height: 18,
                        marginRight: 6
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#666' }}>
                        Share
                      </span>
                    </div>
                  </div>
                </div>
                {/* Comments Section with compress/expand */}
                {showComments[post.id] && (
                  <CommentSection postId={post.id} comments={comments[post.id] || []} onComment={handleComment} />
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="card" style={{
            ...cardStyle,
            animation: 'pulse 1.5s infinite',
            background: '#fff',
            overflow: 'hidden'
          }}>
            <div className="card-body" style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#eee',
                  marginRight: 10,
                  animation: 'shimmer 1.5s infinite'
                }} />
                <div style={{
                  width: '150px',
                  height: 16,
                  background: '#eee',
                  borderRadius: 4,
                  animation: 'shimmer 1.5s infinite'
                }} />
              </div>
              <div style={{
                width: '100%',
                height: 60,
                background: '#eee',
                borderRadius: 4,
                marginBottom: 12,
                animation: 'shimmer 1.5s infinite'
              }} />
              <div style={{
                width: '80%',
                height: 200,
                background: '#eee',
                borderRadius: 8,
                animation: 'shimmer 1.5s infinite'
              }} />
            </div>
            <style>{`
              @keyframes shimmer {
                0% { opacity: 0.5; }
                50% { opacity: 1; }
                100% { opacity: 0.5; }
              }
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(0.998); }
                100% { transform: scale(1); }
              }
            `}</style>
          </div>
        )}
      </div>
      {/* Floating scroll-to-top button */}
      {showUp && (
        <button
          style={{
            position: 'fixed',
            right: 18,
            bottom: 32,
            zIndex: 1000,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          <img src={upIcon} alt="Up" style={{ width: 32, height: 32 }} />
        </button>
      )}
    </div>
  );
}

// Comment section with compress/expand
function CommentSection({ postId, comments, onComment }) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const total = comments.length;
  const showExpand = total > visibleCount;
  const showCompress = expanded && visibleCount > 3;

  const handleExpand = () => {
    setExpanded(true);
    setVisibleCount(v => Math.min(v + 10, total));
  };
  const handleCompress = () => {
    setExpanded(false);
    setVisibleCount(3);
  };

  return (
    <div className="mt-2" style={{ background: '#f1f3f4', borderRadius: 8, padding: 8 }}>
      <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 8 }}>
        {comments.slice(0, visibleCount).map((cmt, idx) => (
          <div key={idx} style={{ fontSize: 14, marginBottom: 4 }}>
            <b>Anon:</b> {cmt}
          </div>
        ))}
        {showExpand && (
          <span 
            onClick={handleExpand} 
            style={{ fontSize: 13, color: '#0d6efd', cursor: 'pointer' }}
          >
            Show more
          </span>
        )}
        {showCompress && (
          <span 
            onClick={handleCompress} 
            style={{ fontSize: 13, color: '#0d6efd', cursor: 'pointer' }}
          >
            Show less
          </span>
        )}
      </div>
      <CommentInput postId={postId} onComment={onComment} />
    </div>
  );
}

// Comment input component
function CommentInput({ postId, onComment }) {
  const [value, setValue] = useState('');
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onComment(postId, value);
        setValue('');
      }
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <input
        type="text"
        placeholder="Write a comment..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 14,
          border: '1px solid #e0e0e0',
          borderRadius: 20,
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          backgroundColor: '#f8f9fa'
        }}
        onFocus={e => e.target.style.borderColor = '#1a73e8'}
        onBlur={e => e.target.style.borderColor = '#e0e0e0'}
      />
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default HomePage;