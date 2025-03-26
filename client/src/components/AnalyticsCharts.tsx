import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mr-4 text-accent">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-3xl font-extrabold text-gray-900 mb-2">{value}</p>
      <p className="text-sm flex items-center">
        {changeType === 'positive' ? (
          <i className="ri-arrow-up-line text-green-600 mr-1"></i>
        ) : (
          <i className="ri-arrow-down-line text-red-600 mr-1"></i>
        )}
        <span className={changeType === 'positive' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {change}
        </span>
        <span className="ml-1 text-gray-600">vs last month</span>
      </p>
    </div>
  );
}

export function AnalyticsCharts() {
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/analytics/stats'],
  });

  const [timeRange, setTimeRange] = useState('month');

  // Line chart data
  const visitorsChartData: ChartData<'line'> = {
    labels: Object.keys(analyticsData?.visitorsByTime || {}),
    datasets: [
      {
        label: 'Visitors',
        data: Object.values(analyticsData?.visitorsByTime || {}),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Line chart options
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Doughnut chart data
  const locationChartData = {
    labels: Object.keys(analyticsData?.visitorsByLocation || {}),
    datasets: [
      {
        data: Object.values(analyticsData?.visitorsByLocation || {}),
        backgroundColor: [
          '#6366f1',
          '#8b5cf6',
          '#d946ef',
          '#ec4899',
          '#94a3b8'
        ],
        borderWidth: 0
      }
    ]
  };

  // Doughnut chart options
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const
      }
    },
    cutout: '70%'
  };

  return (
    <section id="analytics" className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-accent-100 text-accent px-4 py-2 rounded-full text-sm font-medium mb-3">
            Analytics
          </span>
          <h2 className="text-4xl font-bold text-gray-900">Portfolio Insights</h2>
          <p className="mt-4 text-gray-600 max-w-lg mx-auto">
            Track performance metrics and visitor engagement for my portfolio website
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard 
            title="Total Views" 
            value={analyticsData?.totalVisits || 0} 
            change="12%" 
            changeType="positive" 
            icon={<i className="ri-eye-line text-xl"></i>} 
          />
          
          <StatCard 
            title="Unique Visitors" 
            value={analyticsData?.uniqueVisitors || 0} 
            change="8%" 
            changeType="positive" 
            icon={<i className="ri-user-line text-xl"></i>} 
          />
          
          <StatCard 
            title="Avg. Time" 
            value={analyticsData?.avgTimeOnPage || "0:00"} 
            change="3%" 
            changeType="negative" 
            icon={<i className="ri-time-line text-xl"></i>} 
          />
          
          <StatCard 
            title="Conversion" 
            value={analyticsData?.conversionRate || "0%"} 
            change="2%" 
            changeType="positive" 
            icon={<i className="ri-git-branch-line text-xl"></i>} 
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="border border-gray-100 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-lg font-bold text-gray-900">Visitors Over Time</CardTitle>
              <Tabs defaultValue="month" value={timeRange} onValueChange={setTimeRange}>
                <TabsList className="grid grid-cols-3 h-8">
                  <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                  <TabsTrigger value="year" className="text-xs">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[250px]">
                <Line options={lineChartOptions} data={visitorsChartData} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-lg font-bold text-gray-900">Visitors by Location</CardTitle>
              <button className="text-sm text-accent hover:text-accent/90 font-medium">
                See details
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[250px]">
                <Doughnut options={doughnutChartOptions} data={locationChartData} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Referrers Table */}
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Referrers</h3>
            <button className="text-sm text-accent hover:text-accent/90 font-medium flex items-center">
              <span>View all sources</span>
              <i className="ri-arrow-right-line ml-1"></i>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-medium text-gray-600 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-l-lg">Source</th>
                  <th scope="col" className="px-6 py-3">Visitors</th>
                  <th scope="col" className="px-6 py-3">Conversion</th>
                  <th scope="col" className="px-6 py-3 rounded-r-lg">Trend</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.topReferrers?.map((referrer: any, index: number) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-accent-100 text-accent rounded-lg flex items-center justify-center mr-3">
                          <i className={`ri-${referrer.source.toLowerCase()}-line`}></i>
                        </div>
                        <span>{referrer.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{referrer.count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-accent h-2 rounded-full" 
                            style={{ width: `${referrer.percentage * 10}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{referrer.percentage}%</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-medium ${index % 3 === 0 ? "text-red-500" : "text-green-500"}`}>
                      {index % 3 === 0 ? (
                        <span className="flex items-center">
                          <i className="ri-arrow-down-line mr-1"></i>
                          3%
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <i className="ri-arrow-up-line mr-1"></i>
                          {(index + 1) * 7}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
