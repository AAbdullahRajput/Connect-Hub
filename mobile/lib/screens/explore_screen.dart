import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/post_card.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  List<dynamic> _posts = [];
  List<dynamic> _filtered = [];
  bool _loading = true;
  String _error = '';
  String _activeTab = 'all';
  final _searchController = TextEditingController();

  final List<Map<String, String>> _tabs = [
    {'key': 'all', 'label': 'All'},
    {'key': 'image', 'label': '🖼️ Images'},
    {'key': 'video', 'label': '🎥 Videos'},
    {'key': 'text', 'label': '📝 Text'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchPosts() async {
    setState(() { _loading = true; _error = ''; });
    try {
      final res = await ApiService.getAllPosts();
      final posts = res.data['posts'] ?? [];
      setState(() {
        _posts = posts;
        _filtered = posts;
      });
    } catch (e) {
      setState(() => _error = 'Failed to load posts');
    } finally {
      setState(() => _loading = false);
    }
  }

  void _applyFilter(String tab) {
    setState(() {
      _activeTab = tab;
      if (tab == 'all') {
        _filtered = _posts;
      } else {
        _filtered = _posts
            .where((p) =>
                p['post_type'] == tab || p['post_type'] == 'mixed')
            .toList();
      }
    });
  }

  void _handleSearch(String query) {
    if (query.trim().isEmpty) {
      _applyFilter(_activeTab);
      return;
    }
    final q = query.toLowerCase();
    setState(() {
      _filtered = _posts.where((p) {
        final content = (p['content'] ?? '').toLowerCase();
        final name = (p['users']?['name'] ?? '').toLowerCase();
        final username = (p['users']?['username'] ?? '').toLowerCase();
        return content.contains(q) ||
            name.contains(q) ||
            username.contains(q);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'Explore',
          style: TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchController,
              onChanged: _handleSearch,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search posts and users...',
                hintStyle: const TextStyle(color: Color(0xFF52525B)),
                prefixIcon: const Icon(Icons.search,
                    color: Color(0xFF52525B), size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear,
                            color: Color(0xFF52525B), size: 18),
                        onPressed: () {
                          _searchController.clear();
                          _applyFilter(_activeTab);
                        },
                      )
                    : null,
                filled: true,
                fillColor: const Color(0xFF18181B),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(100),
                  borderSide:
                      const BorderSide(color: Color(0xFF27272A)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(100),
                  borderSide:
                      const BorderSide(color: Color(0xFF27272A)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(100),
                  borderSide: const BorderSide(
                      color: Color(0xFF2563EB), width: 1.5),
                ),
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
              ),
            ),
          ),

          // Filter tabs
          SizedBox(
            height: 40,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _tabs.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final tab = _tabs[index];
                final isActive = _activeTab == tab['key'];
                return GestureDetector(
                  onTap: () => _applyFilter(tab['key']!),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isActive
                          ? const Color(0xFF2563EB)
                          : const Color(0xFF18181B),
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(
                        color: isActive
                            ? const Color(0xFF2563EB)
                            : const Color(0xFF27272A),
                      ),
                    ),
                    child: Text(
                      tab['label']!,
                      style: TextStyle(
                        color: isActive
                            ? Colors.white
                            : const Color(0xFF71717A),
                        fontSize: 13,
                        fontWeight: isActive
                            ? FontWeight.w700
                            : FontWeight.w500,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          // Posts
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                        color: Color(0xFF2563EB)))
                : _error.isNotEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('⚠️',
                                style: TextStyle(fontSize: 40)),
                            const SizedBox(height: 12),
                            Text(_error,
                                style: const TextStyle(
                                    color: Color(0xFFF87171),
                                    fontSize: 16)),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _fetchPosts,
                              style: ElevatedButton.styleFrom(
                                backgroundColor:
                                    const Color(0xFF2563EB),
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(10)),
                              ),
                              child: const Text('Retry',
                                  style:
                                      TextStyle(color: Colors.white)),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _fetchPosts,
                        color: const Color(0xFF2563EB),
                        backgroundColor: const Color(0xFF18181B),
                        child: _filtered.isEmpty
                            ? ListView(
                                children: [
                                  SizedBox(
                                    height: MediaQuery.of(context)
                                            .size
                                            .height *
                                        0.5,
                                    child: const Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text('🔍',
                                            style: TextStyle(
                                                fontSize: 48)),
                                        SizedBox(height: 16),
                                        Text(
                                          'No posts found',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                            fontWeight:
                                                FontWeight.w700,
                                          ),
                                        ),
                                        SizedBox(height: 8),
                                        Text(
                                          'Try a different filter',
                                          style: TextStyle(
                                            color: Color(0xFF71717A),
                                            fontSize: 14,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              )
                            : ListView.separated(
                                padding: const EdgeInsets.fromLTRB(
                                    16, 0, 16, 16),
                                itemCount: _filtered.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(height: 12),
                                itemBuilder: (context, index) =>
                                    PostCard(
                                  post: _filtered[index],
                                  onDelete: (id) {
                                    setState(() {
                                      _posts.removeWhere(
                                          (p) => p['id'] == id);
                                      _filtered.removeWhere(
                                          (p) => p['id'] == id);
                                    });
                                  },
                                ),
                              ),
                      ),
          ),
        ],
      ),
    );
  }
}