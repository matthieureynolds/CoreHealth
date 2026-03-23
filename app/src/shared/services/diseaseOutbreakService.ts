/**
 * Disease Outbreak Service - WHO API Implementation
 * Uses WHO Outbreaks API for real-time disease outbreak data
 */

export interface DiseaseOutbreak {
  id: string;
  title: string;
  summary: string;
  publicationDate: string;
  lastModified: string;
  regions: string[];
  healthTopics: string[];
  organizations: string[];
  url: string;
  metaDescription?: string;
  highlight?: string;
  otherRelated?: string;
  source: string;
}

export interface DiseaseOutbreakResponse {
  success: boolean;
  data: DiseaseOutbreak[];
  total: number;
  lastUpdated: string;
  error?: string;
}

/**
 * Get sample disease outbreaks for demonstration
 */
const getSampleOutbreaks = (): DiseaseOutbreak[] => {
  return [
    {
      id: 'sample-1',
      title: 'Influenza A(H1N1) Outbreak in Southeast Asia',
      summary: 'Increased cases of influenza A(H1N1) reported across multiple countries in Southeast Asia. Health authorities are monitoring the situation closely.',
      publicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      regions: ['Southeast Asia', 'Thailand', 'Vietnam', 'Malaysia'],
      healthTopics: ['Influenza', 'Respiratory Diseases', 'Vaccination'],
      organizations: ['WHO', 'CDC', 'Ministry of Health'],
      url: 'https://www.who.int/news/item/sample-influenza-outbreak',
      metaDescription: 'Influenza A(H1N1) outbreak in Southeast Asia - WHO monitoring',
      highlight: 'Increased surveillance recommended',
      otherRelated: 'Related to seasonal influenza patterns',
      source: 'WHO (Sample Data)'
    },
    {
      id: 'sample-2',
      title: 'Dengue Fever Alert in Tropical Regions',
      summary: 'Rising dengue fever cases reported in tropical and subtropical regions. Public health measures are being implemented to control mosquito populations.',
      publicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      regions: ['Tropical Regions', 'Caribbean', 'Central America', 'South America'],
      healthTopics: ['Dengue Fever', 'Vector-borne Diseases', 'Mosquito Control'],
      organizations: ['WHO', 'PAHO', 'Local Health Departments'],
      url: 'https://www.who.int/news/item/sample-dengue-alert',
      metaDescription: 'Dengue fever alert in tropical regions - prevention measures',
      highlight: 'Mosquito control measures recommended',
      otherRelated: 'Related to climate change and vector control',
      source: 'WHO (Sample Data)'
    },
    {
      id: 'sample-3',
      title: 'Measles Outbreak in Undervaccinated Communities',
      summary: 'Measles cases reported in communities with low vaccination coverage. Health authorities are conducting vaccination campaigns to prevent further spread.',
      publicationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      regions: ['Europe', 'North America', 'Australia'],
      healthTopics: ['Measles', 'Vaccination', 'Child Health'],
      organizations: ['WHO', 'UNICEF', 'National Health Services'],
      url: 'https://www.who.int/news/item/sample-measles-outbreak',
      metaDescription: 'Measles outbreak in undervaccinated communities - vaccination campaign',
      highlight: 'Vaccination campaigns underway',
      otherRelated: 'Related to vaccine hesitancy and coverage gaps',
      source: 'WHO (Sample Data)'
    },
    {
      id: 'sample-4',
      title: 'Cholera Outbreak in Water-Scarce Regions',
      summary: 'Cholera cases reported in regions with limited access to clean water and sanitation. Emergency response teams are providing water purification and treatment.',
      publicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      lastModified: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      regions: ['Sub-Saharan Africa', 'Haiti', 'Yemen'],
      healthTopics: ['Cholera', 'Water and Sanitation', 'Emergency Response'],
      organizations: ['WHO', 'UNICEF', 'Red Cross', 'MSF'],
      url: 'https://www.who.int/news/item/sample-cholera-outbreak',
      metaDescription: 'Cholera outbreak in water-scarce regions - emergency response',
      highlight: 'Emergency water and sanitation support needed',
      otherRelated: 'Related to water scarcity and infrastructure',
      source: 'WHO (Sample Data)'
    },
    {
      id: 'sample-5',
      title: 'Ebola Virus Disease in Central Africa',
      summary: 'Ebola virus disease cases reported in Central Africa. Contact tracing and isolation measures are being implemented to prevent further transmission.',
      publicationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      lastModified: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      regions: ['Central Africa', 'Democratic Republic of Congo', 'Uganda'],
      healthTopics: ['Ebola', 'Hemorrhagic Fever', 'Contact Tracing'],
      organizations: ['WHO', 'CDC', 'MSF', 'National Health Services'],
      url: 'https://www.who.int/news/item/sample-ebola-outbreak',
      metaDescription: 'Ebola virus disease in Central Africa - contact tracing measures',
      highlight: 'Contact tracing and isolation measures in place',
      otherRelated: 'Related to previous Ebola outbreaks and preparedness',
      source: 'WHO (Sample Data)'
    }
  ];
};

/**
 * Get disease outbreaks from WHO API
 */
export const getDiseaseOutbreaks = async (
  limit: number = 10,
  offset: number = 0
): Promise<DiseaseOutbreakResponse> => {
  try {
    console.log('🦠 Fetching disease outbreaks from WHO...');
    
    const baseUrl = 'https://www.who.int/api/news/outbreaks';
    const url = `${baseUrl}?$top=${limit}&$skip=${offset}&$orderby=PublicationDate desc`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CoreHealth3/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`WHO API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle OData response format
    const outbreaksData = data.value || data;
    
    if (!Array.isArray(outbreaksData)) {
      throw new Error('Invalid response format from WHO API');
    }
    
    const outbreaks: DiseaseOutbreak[] = outbreaksData.map((item: any) => ({
      id: item.SystemSourceKey || item.UrlName || Math.random().toString(36).substr(2, 9),
      title: item.Title || 'Untitled Outbreak',
      summary: item.Summary || 'No summary available',
      publicationDate: item.PublicationDate || item.DateCreated || new Date().toISOString(),
      lastModified: item.LastModified || item.DateCreated || new Date().toISOString(),
      regions: item.regionscountries ? [item.regionscountries] : [],
      healthTopics: item.healthtopics ? [item.healthtopics] : [],
      organizations: item.organizations ? [item.organizations] : [],
      url: item.ItemDefaultUrl || `https://www.who.int/news/item/${item.UrlName}`,
      metaDescription: item.MetaDescription,
      highlight: item.Highlight,
      otherRelated: item.OtherRelated,
      source: 'WHO'
    }));
    
    // If no outbreaks from API, provide sample data for demonstration
    if (outbreaks.length === 0) {
      console.log('📝 No current outbreaks from WHO API, providing sample data for demonstration');
      const sampleOutbreaks = getSampleOutbreaks();
      return {
        success: true,
        data: sampleOutbreaks.slice(0, limit),
        total: sampleOutbreaks.length,
        lastUpdated: new Date().toISOString(),
      };
    }
    
    return {
      success: true,
      data: outbreaks,
      total: outbreaks.length,
      lastUpdated: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Error fetching disease outbreaks:', error);
    
    return {
      success: false,
      data: [],
      total: 0,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get recent disease outbreaks (last 30 days)
 */
export const getRecentDiseaseOutbreaks = async (limit: number = 5): Promise<DiseaseOutbreakResponse> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const response = await getDiseaseOutbreaks(limit, 0);
    
    if (!response.success) {
      return response;
    }
    
    // Filter for recent outbreaks
    const recentOutbreaks = response.data.filter(outbreak => {
      const outbreakDate = new Date(outbreak.publicationDate);
      return outbreakDate >= thirtyDaysAgo;
    });
    
    return {
      ...response,
      data: recentOutbreaks,
      total: recentOutbreaks.length
    };
    
  } catch (error) {
    console.error('Error fetching recent disease outbreaks:', error);
    return {
      success: false,
      data: [],
      total: 0,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Search disease outbreaks by keyword
 */
export const searchDiseaseOutbreaks = async (
  keyword: string,
  limit: number = 10
): Promise<DiseaseOutbreakResponse> => {
  try {
    console.log('🔍 Searching disease outbreaks for:', keyword);
    
    // Get all outbreaks and filter by keyword
    const response = await getDiseaseOutbreaks(50, 0); // Get more to search through
    
    if (!response.success) {
      return response;
    }
    
    const keywordLower = keyword.toLowerCase();
    const filteredOutbreaks = response.data.filter(outbreak => 
      outbreak.title.toLowerCase().includes(keywordLower) ||
      outbreak.summary.toLowerCase().includes(keywordLower) ||
      outbreak.metaDescription?.toLowerCase().includes(keywordLower) ||
      outbreak.highlight?.toLowerCase().includes(keywordLower)
    ).slice(0, limit);
    
    return {
      ...response,
      data: filteredOutbreaks,
      total: filteredOutbreaks.length
    };
    
  } catch (error) {
    console.error('Error searching disease outbreaks:', error);
    return {
      success: false,
      data: [],
      total: 0,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get disease outbreaks by region
 */
export const getDiseaseOutbreaksByRegion = async (
  region: string,
  limit: number = 10
): Promise<DiseaseOutbreakResponse> => {
  try {
    console.log('🌍 Getting disease outbreaks for region:', region);
    
    const response = await getDiseaseOutbreaks(50, 0); // Get more to filter by region
    
    if (!response.success) {
      return response;
    }
    
    const regionLower = region.toLowerCase();
    const filteredOutbreaks = response.data.filter(outbreak => 
      outbreak.regions.some(r => r.toLowerCase().includes(regionLower)) ||
      outbreak.title.toLowerCase().includes(regionLower) ||
      outbreak.summary.toLowerCase().includes(regionLower)
    ).slice(0, limit);
    
    return {
      ...response,
      data: filteredOutbreaks,
      total: filteredOutbreaks.length
    };
    
  } catch (error) {
    console.error('Error getting disease outbreaks by region:', error);
    return {
      success: false,
      data: [],
      total: 0,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get disease outbreak by ID
 */
export const getDiseaseOutbreakById = async (id: string): Promise<DiseaseOutbreak | null> => {
  try {
    console.log('🔍 Getting disease outbreak by ID:', id);
    
    const response = await getDiseaseOutbreaks(100, 0); // Get more to find by ID
    
    if (!response.success) {
      return null;
    }
    
    const outbreak = response.data.find(o => o.id === id);
    return outbreak || null;
    
  } catch (error) {
    console.error('Error getting disease outbreak by ID:', error);
    return null;
  }
};

/**
 * Format disease outbreak for display
 */
export const formatDiseaseOutbreak = (outbreak: DiseaseOutbreak): string => {
  let formatted = `🦠 ${outbreak.title}\n\n`;
  
  if (outbreak.summary) {
    formatted += `📝 Summary: ${outbreak.summary}\n\n`;
  }
  
  if (outbreak.highlight) {
    formatted += `⚠️ Highlight: ${outbreak.highlight}\n\n`;
  }
  
  if (outbreak.regions.length > 0) {
    formatted += `🌍 Regions: ${outbreak.regions.join(', ')}\n`;
  }
  
  if (outbreak.healthTopics.length > 0) {
    formatted += `🏥 Health Topics: ${outbreak.healthTopics.join(', ')}\n`;
  }
  
  formatted += `📅 Published: ${new Date(outbreak.publicationDate).toLocaleDateString()}\n`;
  formatted += `🔗 Source: ${outbreak.source}\n`;
  
  if (outbreak.url) {
    formatted += `🌐 URL: ${outbreak.url}\n`;
  }
  
  return formatted;
};

/**
 * Get disease outbreak summary for dashboard
 */
export const getDiseaseOutbreakSummary = async (): Promise<{
  totalOutbreaks: number;
  recentOutbreaks: number;
  criticalOutbreaks: number;
  lastUpdated: string;
}> => {
  try {
    const response = await getDiseaseOutbreaks(20, 0);
    
    if (!response.success) {
      return {
        totalOutbreaks: 0,
        recentOutbreaks: 0,
        criticalOutbreaks: 0,
        lastUpdated: new Date().toISOString()
      };
    }
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentOutbreaks = response.data.filter(outbreak => {
      const outbreakDate = new Date(outbreak.publicationDate);
      return outbreakDate >= sevenDaysAgo;
    }).length;
    
    // Count critical outbreaks (those with "urgent", "critical", "emergency" in title/summary)
    const criticalOutbreaks = response.data.filter(outbreak => {
      const text = (outbreak.title + ' ' + outbreak.summary).toLowerCase();
      return text.includes('urgent') || text.includes('critical') || text.includes('emergency');
    }).length;
    
    return {
      totalOutbreaks: response.data.length,
      recentOutbreaks,
      criticalOutbreaks,
      lastUpdated: response.lastUpdated
    };
    
  } catch (error) {
    console.error('Error getting disease outbreak summary:', error);
    return {
      totalOutbreaks: 0,
      recentOutbreaks: 0,
      criticalOutbreaks: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};
