"use client"

import { useState } from "react"
import { Users, Plus, Search } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent, CardHeader } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import PostCard from "../pages/PostCard"
import CreatePost from "../pages/CreatePost"
import CommunityStats from "./CommunityStats"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import { useTranslation } from "react-i18next"

const Community = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("feed")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { createCom, setCreateCom } = useAppContext();
  const naviagte = useNavigate();

  // Sample data - in real app, this would come from your backend
  const [posts, setPosts] = useState([
    {
      id: "1",
      author: {
        name: t('community.posts.sarah.name'),
        avatar: "https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
        location: t('community.posts.sarah.location'),
      },
      destination: t('community.posts.sarah.destination'),
      title: t('community.posts.sarah.title'),
      content: t('community.posts.sarah.content'),
      images: ["https://plus.unsplash.com/premium_photo-1671358446946-8bd43ba08a6a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Z29hJTIwYmVhY2h8ZW58MHx8MHx8fDA%3D", "https://images.unsplash.com/photo-1606203627178-c7bec545dff1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGdvYSUyMGJlYWNofGVufDB8fDB8fHww", "https://plus.unsplash.com/premium_photo-1666286956135-0fb603dad5cf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGdvYSUyMGJlYWNofGVufDB8fDB8fHww"],
      category: t('community.categories.beach'),
      date: t('community.timeAgo.days', { count: 2 }),
      likes: 24,
      comments: 8,
      tags: [t('community.tags.beach'), t('community.tags.hiddenGems'), t('community.tags.seafood'), t('community.tags.sunset')],
      isLiked: false,
    },
    {
      id: "2",
      author: {
        name: t('community.posts.raj.name'),
        avatar: "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
        location: t('community.posts.raj.location'),
      },
      destination: t('community.posts.raj.destination'),
      title: t('community.posts.raj.title'),
      content: t('community.posts.raj.content'),
      images: ["https://images.unsplash.com/photo-1600438831035-48f5f196d3bf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bGFkYWtofGVufDB8fDB8fHww", "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFkYWtofGVufDB8fDB8fHww"],
      category: t('community.categories.adventure'),
      date: t('community.timeAgo.week', { count: 1 }),
      likes: 45,
      comments: 12,
      tags: [t('community.tags.soloTravel'), t('community.tags.adventure'), t('community.tags.mountains'), t('community.tags.biking')],
      isLiked: true,
    },
    {
      id: "3",
      author: {
        name: t('community.posts.priya.name'),
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
        location: t('community.posts.priya.location'),
      },
      destination: t('community.posts.priya.destination'),
      title: t('community.posts.priya.title'),
      content: t('community.posts.priya.content'),
      images: ["https://plus.unsplash.com/premium_photo-1661962428918-6a57ab674e23?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFqYXN0aGFufGVufDB8fDB8fHww"],
      category: t('community.categories.heritage'),
      date: t('community.timeAgo.days', { count: 3 }),
      likes: 32,
      comments: 15,
      tags: [t('community.tags.heritage'), t('community.tags.culture'), t('community.tags.familyTrip'), t('community.tags.palaces')],
      isLiked: false,
    },
  ])

  const categories = [
    t('community.categories.all'),
    t('community.categories.beach'),
    t('community.categories.adventure'),
    t('community.categories.heritage'),
    t('community.categories.hillStation'),
    t('community.categories.wildlife'),
    t('community.categories.spiritual')
  ]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === t('community.categories.all') || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post,
      ),
    )
  }

  const handleNewPost = (newPost) => {
    const post = {
      ...newPost,
      id: Date.now().toString(),
      likes: 0,
      comments: 0,
      isLiked: false,
    }
    setPosts([post, ...posts])
    setActiveTab("feed")
  }

  return (
    <div className="min-h-screen bg-[#ebebeb] py-8 mt-24">
      <div className="max-w-6xl px-4 mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-full max-w-[960px]">
            <svg width="1360" height="159" viewBox="0 0 1360 159" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full max-w-[760px] mx-auto">
            <path d="M126.533 61V31.048H96.7725V16.2H176.133V31.048H146.373V61H126.533ZM180.775 61V16.2H244.583C249.148 16.2 252.647 17.224 255.079 19.272C257.511 21.2773 258.727 24.0507 258.727 27.592C258.727 30.3227 257.895 32.5413 256.231 34.248C254.567 35.9547 251.964 37.128 248.423 37.768V39.048C252.305 39.3893 255.228 40.4987 257.191 42.376C259.153 44.2107 260.135 46.6 260.135 49.544V61H239.399V50.184C239.399 49.416 239.164 48.7973 238.695 48.328C238.225 47.8587 237.585 47.624 236.775 47.624H200.615V61H180.775ZM200.615 35.464H235.495C236.305 35.464 236.945 35.208 237.415 34.696C237.884 34.184 238.119 33.5013 238.119 32.648C238.119 31.7093 237.863 31.0053 237.351 30.536C236.839 30.0667 236.22 29.832 235.495 29.832H200.615V35.464ZM261.803 61L289.772 16.2H313.26L341.164 61H319.852L316.012 54.024H287.148L283.116 61H261.803ZM295.66 39.176L293.484 43.016H309.932L307.82 39.176L302.508 28.296H301.228L295.66 39.176ZM354.394 61L326.489 16.2H348.698L365.85 46.536L383.642 16.2H405.85L377.882 61H354.394ZM409.087 61V16.2H488.447V29.128H428.927V33.096H481.535V44.104H428.927V48.072H488.447V61H409.087ZM494.65 61V16.2H514.49V46.152H574.01V61H494.65ZM634.03 62.024C626.009 62.024 619.011 61.0853 613.038 59.208C607.107 57.3307 602.521 54.6853 599.278 51.272C596.035 47.816 594.414 43.72 594.414 38.984V38.216C594.414 33.48 596.035 29.4053 599.278 25.992C602.521 22.536 607.107 19.8693 613.038 17.992C619.011 16.1147 626.009 15.176 634.03 15.176C643.715 15.176 651.907 16.5627 658.606 19.336C665.305 22.0667 670.339 25.9067 673.71 30.856L653.806 36.744C652.099 34.5253 649.603 32.84 646.318 31.688C643.075 30.4933 638.979 29.896 634.03 29.896C630.275 29.896 626.969 30.2373 624.11 30.92C621.294 31.6027 619.097 32.5627 617.518 33.8C615.939 35.0373 615.15 36.5093 615.15 38.216V38.984C615.15 40.6907 615.939 42.184 617.518 43.464C619.097 44.7013 621.294 45.6613 624.11 46.344C626.969 46.984 630.275 47.304 634.03 47.304C638.979 47.304 643.075 46.728 646.318 45.576C649.603 44.3813 652.099 42.6747 653.806 40.456L673.71 46.344C670.339 51.2933 665.305 55.1547 658.606 57.928C651.907 60.6587 643.715 62.024 634.03 62.024ZM715.157 62.024C707.05 62.024 700.01 61.1067 694.037 59.272C688.106 57.3947 683.519 54.728 680.277 51.272C677.077 47.816 675.477 43.72 675.477 38.984V38.216C675.477 33.4373 677.077 29.3413 680.277 25.928C683.519 22.472 688.106 19.8267 694.037 17.992C700.01 16.1147 707.05 15.176 715.157 15.176C723.306 15.176 730.346 16.1147 736.277 17.992C742.207 19.8267 746.773 22.472 749.973 25.928C753.215 29.3413 754.837 33.4373 754.837 38.216V38.984C754.837 43.72 753.215 47.816 749.973 51.272C746.773 54.728 742.207 57.3947 736.277 59.272C730.346 61.1067 723.306 62.024 715.157 62.024ZM715.157 47.304C721.002 47.304 725.61 46.5787 728.981 45.128C732.394 43.6347 734.101 41.5867 734.101 38.984V38.216C734.101 35.6133 732.394 33.5867 728.981 32.136C725.61 30.6427 721.002 29.896 715.157 29.896C709.354 29.896 704.746 30.6427 701.333 32.136C697.919 33.5867 696.213 35.6133 696.213 38.216V38.984C696.213 41.5867 697.919 43.6347 701.333 45.128C704.746 46.5787 709.354 47.304 715.157 47.304ZM759.962 61V16.2H789.594L799.642 35.592L809.69 16.2H839.322V61H820.122V33.48L820.058 33.672L805.85 61H793.434L779.226 33.672L779.162 33.48V61H759.962ZM846.775 61V16.2H876.407L886.455 35.592L896.503 16.2H926.135V61H906.935V33.48L906.871 33.672L892.663 61H880.247L866.039 33.672L865.975 33.48V61H846.775ZM972.435 62.024C945.982 62.024 932.755 53.512 932.755 36.488V16.2H952.595V35.848C952.595 43.4853 959.208 47.304 972.435 47.304C985.662 47.304 992.275 43.4853 992.275 35.848V16.2H1012.12V36.488C1012.12 53.512 998.888 62.024 972.435 62.024ZM1018.71 61V16.2H1038.3L1078.23 40.904V16.2H1098.07V61H1078.49L1038.55 36.296V61H1018.71ZM1104.56 61V46.152H1134.32V31.048H1104.56V16.2H1183.92V31.048H1154.16V46.152H1183.92V61H1104.56ZM1217.41 61V31.048H1187.65V16.2H1267.01V31.048H1237.25V61H1217.41ZM1297.44 61V44.872L1267.68 16.2H1292.45L1307.36 30.984L1322.27 16.2H1347.04L1317.28 44.872V61H1297.44Z" fill="#323232"/>
            </svg>
          </div>
          <p className="mx-auto mt-2 max-w-2xl px-2 text-base leading-relaxed text-gray-600 sm:-mt-2 sm:px-0 sm:text-lg">
            {t('community.subtitle')}
          </p>
        </div>
        {/*Community Stats*/}
        <CommunityStats />
        {/* Navigation Tabs*/}
        <div className="flex justify-center mb-8">
          <div className="p-1 bg-white rounded-lg shadow-md">
            <Button
              variant={activeTab === "feed" ? "default" : "ghost"}
              onClick={() => setActiveTab("feed")}
              className="px-6 py-2"
            >
              <Users className="w-4 h-4 mr-2" />
              {t('community.tabs.feed')}
            </Button>
            <Button
              variant={activeTab === "create" ? "default" : "ghost"}
              onClick={() => {
                setActiveTab("create");
                setCreateCom(true);
              }}
              className="px-6 py-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('community.tabs.share')}
            </Button>
          </div>
        </div>
        {activeTab === "feed" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <h3 className="font-semibold text-gray-800">{t('community.filters.title')}</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      placeholder={t('community.filters.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="mb-2 font-medium text-gray-700">{t('community.filters.categories')}</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="justify-start w-full"
                        >
                          {category === t('community.categories.all') ? t('community.filters.allPosts') : category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Tags */}
                  <div>
                    <h4 className="mb-2 font-medium text-gray-700">{t('community.filters.popularTags')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        t('community.tags.hiddenGems'),
                        t('community.tags.soloTravel'),
                        t('community.tags.familyTrip'),
                        t('community.tags.adventure'),
                        t('community.tags.budgetTravel')
                      ].map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} />)
                ) : (
                  <Card className="py-12 text-center">
                    <CardContent>
                      <div className="text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="mb-2 text-lg font-medium">{t('community.noPosts.title')}</h3>
                        <p>{t('community.noPosts.message')}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          <CreatePost onSubmit={handleNewPost} />
        )}
      </div>
    </div>
  )
}

export default Community