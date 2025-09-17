// Demo profile data for testing and showcasing the application
export const getDemoProfileData = () => {
  return {
    id: 'demo-profile-123',
    name: 'Alex Chen - Software Engineer',
    header: {
      name: 'Alex Chen',
      email: 'alex.chen@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      links: [
        'https://linkedin.com/in/alexchen',
        'https://github.com/alexchen',
        'https://alexchen.dev'
      ]
    },
    experience: [
      {
        id: '1',
        title: 'Senior Full Stack Engineer',
        company: 'TechStart Inc.',
        start: 'Jan 2022',
        end: 'present',
        scope: 'Lead development of scalable web applications using React, Node.js, and AWS. Mentor junior developers and drive architectural decisions.',
        top_achievements: [
          'Built and deployed 5 major product features serving 50K+ active users',
          'Reduced application load time by 40% through performance optimization and caching',
          'Led code reviews and established development best practices for team of 8 engineers'
        ],
        tools: ['React', 'Node.js', 'AWS', 'TypeScript', 'PostgreSQL', 'Docker']
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        company: 'Digital Solutions Corp',
        start: 'Mar 2020',
        end: 'Dec 2021',
        scope: 'Developed and maintained web applications using JavaScript, Python, and PostgreSQL. Collaborated with design and product teams.',
        top_achievements: [
          'Built responsive web applications using React, TypeScript, and Redux',
          'Developed RESTful APIs and GraphQL endpoints with Node.js and Express',
          'Optimized database queries resulting in 60% performance improvement'
        ],
        tools: ['React', 'TypeScript', 'Redux', 'Node.js', 'Express', 'PostgreSQL']
      },
      {
        id: '3',
        title: 'Software Developer',
        company: 'InnovateLab',
        start: 'Jun 2018',
        end: 'Feb 2020',
        scope: 'Junior developer contributing to frontend and backend development of SaaS platform. Gained experience in modern web technologies.',
        top_achievements: [
          'Developed user-facing features using React and Vue.js frameworks',
          'Assisted in backend development using Node.js and MongoDB',
          'Fixed bugs and implemented feature requests from customer feedback'
        ],
        tools: ['React', 'Vue.js', 'Node.js', 'MongoDB', 'JavaScript', 'Git']
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of California, Berkeley',
        year: '2018',
        highlights: [
          'Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems',
          'GPA: 3.7/4.0 • Dean\'s List 2017-2018'
        ]
      },
      {
        id: '2',
        degree: 'Full Stack Engineering Path',
        school: 'Codecademy',
        year: '2017',
        highlights: [
          'Comprehensive program covering HTML, CSS, JavaScript, React, Node.js, Express, SQL'
        ]
      }
    ],
    skills: {
      hard_skills: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
        'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'REST APIs', 'GraphQL'
      ],
      soft_skills: [
        'Team Leadership', 'Problem Solving', 'Communication', 'Mentoring'
      ]
    },
    projects: [
      {
        id: '1',
        name: 'E-commerce Platform',
        role: 'Full Stack Developer',
        description: 'Full-stack e-commerce platform with React frontend, Node.js backend, and Stripe payment integration. Achieved 99.9% uptime with proper error handling and monitoring.',
        impact_metric: {
          name: 'User Growth',
          value: '250',
          unit: '% increase'
        },
        link: 'https://github.com/alexchen/ecommerce-platform'
      },
      {
        id: '2',
        name: 'Real-time Chat Application',
        role: 'Lead Developer',
        description: 'Collaborative chat application with real-time messaging, file sharing, and video calls using WebSocket connections and WebRTC.',
        impact_metric: {
          name: 'Message Throughput',
          value: '10K',
          unit: 'messages/minute'
        },
        link: 'https://github.com/alexchen/realtime-chat'
      }
    ],
    evidence: []
  };
};
