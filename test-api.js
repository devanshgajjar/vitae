// Quick test script to verify the profile API is working
const testProfile = {
  user_id: 'demo-user-123',
  name: 'Test Profile',
  profile_data: {
    header: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      location: 'San Francisco, CA',
      links: ['https://linkedin.com/in/johndoe', 'https://github.com/johndoe']
    },
    experience: [
      {
        title: 'Software Engineer',
        company: 'Tech Corp',
        start: 'Jan 2020',
        end: 'present',
        scope: 'Full-stack development for web applications',
        top_achievements: [
          'Built scalable React application serving 10k+ users',
          'Reduced API response time by 40% through optimization',
          'Led team of 3 developers on critical project'
        ],
        tools: ['React', 'Node.js', 'PostgreSQL', 'AWS']
      }
    ],
    education: [
      {
        degree: 'BS Computer Science',
        school: 'University of California',
        year: '2019',
        highlights: ['Magna Cum Laude', 'Dean\'s List']
      }
    ],
    skills: {
      hard_skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS'],
      soft_skills: ['Leadership', 'Communication', 'Problem Solving']
    },
    projects: [
      {
        name: 'E-commerce Platform',
        role: 'Lead Developer',
        description: 'Built full-stack e-commerce solution with payment integration',
        link: 'https://github.com/johndoe/ecommerce'
      }
    ],
    evidence: []
  }
};

async function testAPI() {
  try {
    console.log('Testing profile creation API...');
    
    const response = await fetch('http://localhost:3000/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProfile),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Raw response:', responseText);
      try {
        const errorData = JSON.parse(responseText);
        console.error('API Error:', errorData);
      } catch (e) {
        console.error('Failed to parse error response as JSON');
      }
      return;
    }

    const result = await response.json();
    console.log('✅ Profile created successfully!');
    console.log('Profile ID:', result.profile.id);
    
    // Test fetching profiles
    const fetchResponse = await fetch(`http://localhost:3000/api/profiles?user_id=${testProfile.user_id}`);
    const fetchResult = await fetchResponse.json();
    console.log('✅ Profile fetch successful!');
    console.log('Number of profiles:', fetchResult.profiles.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPI();
