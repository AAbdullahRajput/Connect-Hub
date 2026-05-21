import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/post_card.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  Map<String, dynamic>? profile;
  List<dynamic> posts = [];
  List<dynamic> followers = [];
  List<dynamic> following = [];
  bool loading = true;
  bool isFollowing = false;
  bool followLoading = false;
  int followersCount = 0;
  String? username;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final arg = ModalRoute.of(context)?.settings.arguments as String?;
    if (arg != null && arg != username) {
      username = arg;
      _loadProfile();
    }
  }

  void _showOptionsMenu() {
    final isOwn = context.read<AuthProvider>().userId == profile?['id'];
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF18181B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF3F3F46),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            if (isOwn) ...[
              ListTile(
                leading:
                    const Icon(Icons.edit_outlined, color: Colors.white),
                title: const Text('Edit Profile',
                    style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/edit-profile',
                      arguments: profile);
                },
              ),
              ListTile(
                leading:
                    const Icon(Icons.logout, color: Color(0xFFF87171)),
                title: const Text('Log Out',
                    style: TextStyle(color: Color(0xFFF87171))),
                onTap: () {
                  Navigator.pop(context);
                  context.read<AuthProvider>().logout();
                  Navigator.pushNamedAndRemoveUntil(
                      context, '/login', (_) => false);
                },
              ),
            ] else ...[
              ListTile(
                leading:
                    const Icon(Icons.block, color: Color(0xFFF87171)),
                title: const Text('Block User',
                    style: TextStyle(color: Color(0xFFF87171))),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.flag_outlined,
                    color: Colors.white),
                title: const Text('Report',
                    style: TextStyle(color: Colors.white)),
                onTap: () => Navigator.pop(context),
              ),
            ],
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _loadProfile() async {
    setState(() => loading = true);
    try {
      final profileRes = await ApiService.getUserProfile(username!);
      final profileData =
          profileRes.data['user'] as Map<String, dynamic>;

      final postsRes = await ApiService.getAllPosts();
      final allPosts = postsRes.data['posts'] ?? [];
      final userPosts = (allPosts as List)
          .where((p) => p['user_id'] == profileData['id'])
          .toList();

      setState(() {
        profile = profileData;
        posts = userPosts;
        followersCount = profileData['followers_count'] ?? 0;
        loading = false;
      });

      final auth = context.read<AuthProvider>();
      if (auth.userId != profileData['id']) {
        try {
          final followRes =
              await ApiService.checkFollow(profileData['id']);
          setState(
              () => isFollowing = followRes.data['is_following'] ?? false);
        } catch (_) {}
      }
    } catch (e) {
      setState(() => loading = false);
    }
  }

  Future<void> _showFollowersSheet(
      {required bool showFollowing}) async {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF18181B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      isScrollControlled: true,
      builder: (ctx) {
        return _FollowersSheet(
          profileId: profile!['id'],
          showFollowing: showFollowing,
        );
      },
    );
  }

  Future<void> _toggleFollow() async {
    final profileId = profile?['id'];
    if (profileId == null || followLoading) return;
    setState(() => followLoading = true);
    try {
      if (isFollowing) {
        await ApiService.unfollowUser(profileId);
        setState(() {
          isFollowing = false;
          followersCount--;
        });
      } else {
        await ApiService.followUser(profileId);
        setState(() {
          isFollowing = true;
          followersCount++;
        });
      }
    } catch (e) {
      debugPrint('Follow error: $e');
    } finally {
      setState(() => followLoading = false);
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return 'Joined ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final isOwn = auth.userId == profile?['id'];

    if (loading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child:
              CircularProgressIndicator(color: Color(0xFF2563EB)),
        ),
      );
    }

    if (profile == null) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          leading: IconButton(
            icon:
                const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: const Center(
          child: Text('User not found',
              style: TextStyle(color: Color(0xFFF87171))),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          // ── SliverAppBar with cover ──────────────────────────
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: Colors.black,
            elevation: 0,
            leading: _CircleIconButton(
              onTap: () => Navigator.pop(context),
              child: const Icon(Icons.arrow_back,
                  color: Colors.white, size: 20),
            ),
            actions: [
              _CircleIconButton(
                onTap: () => _showOptionsMenu(),
                child: const Icon(Icons.more_horiz,
                    color: Colors.white, size: 20),
              ),
              const SizedBox(width: 8),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  profile?['cover_photo'] != null
                      ? Image.network(
                          profile!['cover_photo'],
                          fit: BoxFit.cover,
                          alignment: Alignment(
                            0,
                            ((profile?['cover_position'] ?? 50) - 50) /
                                50,
                          ),
                          errorBuilder: (_, __, ___) =>
                              _coverPlaceholder(),
                        )
                      : _coverPlaceholder(),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.transparent,
                          Color(0x99000000),
                          Colors.black,
                        ],
                        stops: [0.0, 0.5, 0.8, 1.0],
                      ),
                    ),
                  ),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Color(0x99000000),
                          Colors.transparent
                        ],
                        stops: [0.0, 0.4],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Profile info ─────────────────────────────────────
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Avatar row ──
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Padding(
                      padding:
                          const EdgeInsets.fromLTRB(16, 52, 16, 0),
                      child: Row(
                        children: [
                          const SizedBox(width: 100),
                          const Spacer(),
                          Row(
                            children: [
                              if (!isOwn)
                                _OutlineIconBtn(
                                  onTap: () {},
                                  child: const Icon(
                                      Icons.mail_outline,
                                      color: Colors.white,
                                      size: 18),
                                ),
                              if (!isOwn) const SizedBox(width: 8),
                              isOwn
                                  ? _PillButton(
                                      label: 'Edit Profile',
                                      onTap: () =>
                                          Navigator.pushNamed(
                                              context, '/edit-profile',
                                              arguments: profile),
                                      filled: false,
                                    )
                                  : _PillButton(
                                      label: isFollowing
                                          ? 'Following'
                                          : 'Follow',
                                      onTap: followLoading
                                          ? null
                                          : _toggleFollow,
                                      filled: !isFollowing,
                                      loading: followLoading,
                                    ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Positioned(
                      top: -2,
                      left: 16,
                      child: _Avatar(
                        imageUrl: profile?['profile_picture'],
                        name: profile?['name'] ?? 'U',
                        size: 88,
                        // ── KEY FIX: use -0.6 to show face area ──
                        avatarAlignment: const Alignment(0, -1.0),
                      ),
                    ),
                  ],
                ),

                // ── Name, bio, meta, stats ──
                Padding(
                  padding:
                      const EdgeInsets.fromLTRB(16, 10, 16, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              profile?['name'] ?? '',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.5,
                              ),
                            ),
                          ),
                          if (followersCount >= 10) ...[
                            const SizedBox(width: 6),
                            const Icon(Icons.verified,
                                color: Color(0xFF2563EB), size: 20),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '@${profile?['username'] ?? ''}',
                        style: const TextStyle(
                          color: Color(0xFF71717A),
                          fontSize: 14,
                        ),
                      ),
                      if (profile?['bio'] != null &&
                          profile!['bio'].toString().isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(
                          profile!['bio'],
                          style: const TextStyle(
                            color: Color(0xFFD4D4D8),
                            fontSize: 14,
                            height: 1.6,
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 16,
                        runSpacing: 6,
                        children: [
                          if (profile?['location'] != null &&
                              profile!['location']
                                  .toString()
                                  .isNotEmpty)
                            _MetaItem(
                              icon: Icons.location_on_outlined,
                              label: profile!['location'],
                            ),
                          if (profile?['website'] != null &&
                              profile!['website']
                                  .toString()
                                  .isNotEmpty)
                            _MetaItem(
                              icon: Icons.link,
                              label: profile!['website'],
                              color: const Color(0xFF60A5FA),
                            ),
                          _MetaItem(
                            icon: Icons.calendar_today_outlined,
                            label: _formatDate(profile?['created_at']),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          _StatButton(
                            count: posts.length,
                            label: 'Posts',
                            onTap: null,
                          ),
                          const SizedBox(width: 28),
                          _StatButton(
                            count: followersCount,
                            label: 'Followers',
                            onTap: () => _showFollowersSheet(
                                showFollowing: false),
                          ),
                          const SizedBox(width: 28),
                          _StatButton(
                            count:
                                profile?['following_count'] ?? 0,
                            label: 'Following',
                            onTap: () => _showFollowersSheet(
                                showFollowing: true),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),

                const Divider(color: Color(0xFF27272A), height: 1),

                TabBar(
                  controller: _tabController,
                  indicatorColor: const Color(0xFF2563EB),
                  indicatorWeight: 2,
                  labelColor: Colors.white,
                  unselectedLabelColor: const Color(0xFF52525B),
                  labelStyle: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                  tabs: const [
                    Tab(text: 'Posts'),
                    Tab(text: 'Liked'),
                  ],
                ),
              ],
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            posts.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.article_outlined,
                            color: Color(0xFF3F3F46), size: 52),
                        SizedBox(height: 16),
                        Text('No posts yet',
                            style: TextStyle(
                                color: Color(0xFF71717A),
                                fontSize: 16,
                                fontWeight: FontWeight.w600)),
                        SizedBox(height: 6),
                        Text('Posts will appear here',
                            style: TextStyle(
                                color: Color(0xFF52525B),
                                fontSize: 13)),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding:
                        const EdgeInsets.fromLTRB(12, 12, 12, 24),
                    itemCount: posts.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: 12),
                    itemBuilder: (context, index) => PostCard(
                      post: posts[index],
                      onDelete: (id) => setState(() =>
                          posts.removeWhere((p) => p['id'] == id)),
                    ),
                  ),
            const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.favorite_border,
                      color: Color(0xFF3F3F46), size: 52),
                  SizedBox(height: 16),
                  Text('Liked posts',
                      style: TextStyle(
                          color: Color(0xFF71717A),
                          fontSize: 16,
                          fontWeight: FontWeight.w600)),
                  SizedBox(height: 6),
                  Text('Coming soon',
                      style: TextStyle(
                          color: Color(0xFF52525B), fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _coverPlaceholder() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF0D0D1F),
            Color(0xFF1A1A3A),
            Color(0xFF0D0D1F)
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════
// Followers Sheet
// ═══════════════════════════════════════════════════════════
class _FollowersSheet extends StatefulWidget {
  final String profileId;
  final bool showFollowing;

  const _FollowersSheet({
    required this.profileId,
    required this.showFollowing,
  });

  @override
  State<_FollowersSheet> createState() => _FollowersSheetState();
}

class _FollowersSheetState extends State<_FollowersSheet>
    with SingleTickerProviderStateMixin {
  List<dynamic> followers = [];
  List<dynamic> following = [];
  bool loading = true;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.showFollowing ? 1 : 0,
    );
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        ApiService.getFollowers(widget.profileId),
        ApiService.getFollowing(widget.profileId),
      ]);
      if (mounted) {
        setState(() {
          followers = results[0].data['followers'] ?? [];
          following = results[1].data['following'] ?? [];
          loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => loading = false);
      debugPrint('Followers load error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      maxChildSize: 0.92,
      minChildSize: 0.4,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Color(0xFF18181B),
            borderRadius:
                BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin:
                    const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF3F3F46),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Container(
                margin:
                    const EdgeInsets.fromLTRB(16, 0, 16, 0),
                decoration: BoxDecoration(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: Colors.white,
                  unselectedLabelColor:
                      const Color(0xFF71717A),
                  labelStyle: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                  tabs: [
                    Tab(
                      child: Row(
                        mainAxisAlignment:
                            MainAxisAlignment.center,
                        children: [
                          const Text('Followers'),
                          const SizedBox(width: 6),
                          if (!loading)
                            Container(
                              padding:
                                  const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 1),
                              decoration: BoxDecoration(
                                color: Colors.white
                                    .withOpacity(0.15),
                                borderRadius:
                                    BorderRadius.circular(100),
                              ),
                              child: Text(
                                '${followers.length}',
                                style: const TextStyle(
                                    fontSize: 11),
                              ),
                            ),
                        ],
                      ),
                    ),
                    Tab(
                      child: Row(
                        mainAxisAlignment:
                            MainAxisAlignment.center,
                        children: [
                          const Text('Following'),
                          const SizedBox(width: 6),
                          if (!loading)
                            Container(
                              padding:
                                  const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 1),
                              decoration: BoxDecoration(
                                color: Colors.white
                                    .withOpacity(0.15),
                                borderRadius:
                                    BorderRadius.circular(100),
                              ),
                              child: Text(
                                '${following.length}',
                                style: const TextStyle(
                                    fontSize: 11),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Divider(
                  color: Color(0xFF27272A), height: 1),
              Expanded(
                child: loading
                    ? const Center(
                        child: CircularProgressIndicator(
                            color: Color(0xFF2563EB)),
                      )
                    : TabBarView(
                        controller: _tabController,
                        children: [
                          _UserList(
                            users: followers,
                            emptyMessage: 'No followers yet',
                            emptySubMessage:
                                'When people follow this account, they\'ll appear here',
                            scrollController:
                                scrollController,
                          ),
                          _UserList(
                            users: following,
                            emptyMessage:
                                'Not following anyone yet',
                            emptySubMessage:
                                'When this account follows people, they\'ll appear here',
                            scrollController:
                                scrollController,
                          ),
                        ],
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── User list inside sheet ────────────────────────────────
class _UserList extends StatelessWidget {
  final List<dynamic> users;
  final String emptyMessage;
  final String emptySubMessage;
  final ScrollController scrollController;

  const _UserList({
    required this.users,
    required this.emptyMessage,
    required this.emptySubMessage,
    required this.scrollController,
  });

  @override
  Widget build(BuildContext context) {
    if (users.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.people_outline,
                    color: Color(0xFF3F3F46), size: 36),
              ),
              const SizedBox(height: 16),
              Text(
                emptyMessage,
                style: const TextStyle(
                  color: Color(0xFFA1A1AA),
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                emptySubMessage,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF52525B),
                  fontSize: 13,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      controller: scrollController,
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: users.length,
      separatorBuilder: (_, __) =>
          const Divider(color: Color(0xFF27272A), height: 1),
      itemBuilder: (context, index) {
        final u = users[index] as Map<String, dynamic>;
        return _UserListTile(user: u);
      },
    );
  }
}

// ─── Avatar Widget ────────────────────────────────────────
class _Avatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double size;
  final Alignment avatarAlignment;

  const _Avatar({
    required this.imageUrl,
    required this.name,
    required this.size,
    this.avatarAlignment = const Alignment(0, -1.0), // ← default: upper face area
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.6),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipOval(
  child: imageUrl != null
      ? Image.network(
          // Append Supabase transform to crop top portion
          imageUrl!.contains('supabase')
              ? '$imageUrl?width=400&height=400&resize=cover&gravity=north'
              : imageUrl!,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _fallback(),
        )
      : _fallback(),
),
    );
  }

  Widget _fallback() {
    return Container(
      color: const Color(0xFF2563EB),
      child: Center(
        child: Text(
          name[0].toUpperCase(),
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.38,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}

// ─── Circle Icon Button ───────────────────────────────────
class _CircleIconButton extends StatelessWidget {
  final VoidCallback onTap;
  final Widget child;

  const _CircleIconButton(
      {required this.onTap, required this.child});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.all(8),
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.55),
          shape: BoxShape.circle,
          border: Border.all(
              color: Colors.white.withOpacity(0.15)),
        ),
        child: Center(child: child),
      ),
    );
  }
}

// ─── Outline Icon Button ──────────────────────────────────
class _OutlineIconBtn extends StatelessWidget {
  final VoidCallback onTap;
  final Widget child;

  const _OutlineIconBtn(
      {required this.onTap, required this.child});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFF3F3F46)),
          color: const Color(0xFF18181B),
        ),
        child: Center(child: child),
      ),
    );
  }
}

// ─── Pill Button ─────────────────────────────────────────
class _PillButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool filled;
  final bool loading;

  const _PillButton({
    required this.label,
    required this.onTap,
    required this.filled,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 38,
        padding:
            const EdgeInsets.symmetric(horizontal: 18),
        decoration: BoxDecoration(
          color: filled
              ? const Color(0xFF2563EB)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: filled
                ? const Color(0xFF2563EB)
                : const Color(0xFF3F3F46),
          ),
        ),
        child: Center(
          child: loading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2),
                )
              : Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
        ),
      ),
    );
  }
}

// ─── Meta Item ────────────────────────────────────────────
class _MetaItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _MetaItem({
    required this.icon,
    required this.label,
    this.color = const Color(0xFF71717A),
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: const Color(0xFF52525B)),
        const SizedBox(width: 5),
        Text(label,
            style: TextStyle(color: color, fontSize: 13)),
      ],
    );
  }
}

// ─── Stat Button ─────────────────────────────────────────
class _StatButton extends StatelessWidget {
  final int count;
  final String label;
  final VoidCallback? onTap;

  const _StatButton({
    required this.count,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$count',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              color: onTap != null
                  ? const Color(0xFFA1A1AA)
                  : const Color(0xFF71717A),
              fontSize: 13,
              decoration: onTap != null
                  ? TextDecoration.underline
                  : null,
              decorationColor: const Color(0xFF52525B),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── User List Tile ───────────────────────────────────────
class _UserListTile extends StatelessWidget {
  final Map<String, dynamic> user;

  const _UserListTile({required this.user});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        Navigator.pushNamed(context, '/profile',
            arguments: user['username']);
      },
      child: Container(
        color: Colors.transparent,
        padding: const EdgeInsets.symmetric(
            horizontal: 20, vertical: 14),
        child: Row(
          children: [
            ClipOval(
  child: user['profile_picture'] != null
      ? Image.network(
          (user['profile_picture'] as String).contains('supabase')
              ? '${user['profile_picture']}?width=200&height=200&resize=cover&gravity=north'
              : user['profile_picture'],
          width: 46,
          height: 46,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _fallbackAvatar(),
        )
      : _fallbackAvatar(),
),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  Text(
                    user['name'] ?? '',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '@${user['username'] ?? ''}',
                    style: const TextStyle(
                      color: Color(0xFF71717A),
                      fontSize: 13,
                    ),
                  ),
                  if (user['bio'] != null &&
                      user['bio']
                          .toString()
                          .isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      user['bio'],
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF52525B),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right,
                color: Color(0xFF3F3F46), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _fallbackAvatar() {
    return Container(
      width: 46,
      height: 46,
      color: const Color(0xFF2563EB),
      child: Center(
        child: Text(
          (user['name'] ?? 'U')[0].toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
      ),
    );
  }
}