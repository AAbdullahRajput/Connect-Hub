import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class PostDetailScreen extends StatefulWidget {
  const PostDetailScreen({super.key});

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  Map<String, dynamic>? post;
  List<dynamic> comments = [];
  bool loading = true;
  bool commentsLoading = true;
  bool liked = false;
  late int likesCount;
  bool likeLoading = false;
  bool commentPosting = false;
  String? postId;
  final _commentController = TextEditingController();

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final arg = ModalRoute.of(context)?.settings.arguments as String?;
    if (arg != null && arg != postId) {
      postId = arg;
      _loadPost();
      _loadComments();
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _loadPost() async {
    setState(() => loading = true);
    try {
      final res = await ApiService.getSinglePost(postId!);
      final postData = res.data['post'] as Map<String, dynamic>;
      setState(() {
        post = postData;
        likesCount = postData['likes_count'] ?? 0;
        loading = false;
      });
    } catch (e) {
      setState(() => loading = false);
    }
  }

  Future<void> _loadComments() async {
    setState(() => commentsLoading = true);
    try {
      final res = await ApiService.getComments(postId!);
      setState(() {
        comments = res.data['comments'] ?? [];
        commentsLoading = false;
      });
    } catch (e) {
      setState(() => commentsLoading = false);
    }
  }

  Future<void> _toggleLike() async {
    if (likeLoading) return;
    setState(() => likeLoading = true);
    try {
      if (liked) {
        await ApiService.unlikePost(postId!);
        setState(() { liked = false; likesCount--; });
      } else {
        await ApiService.likePost(postId!);
        setState(() { liked = true; likesCount++; });
      }
    } catch (e) {
      debugPrint('Like error: $e');
    } finally {
      setState(() => likeLoading = false);
    }
  }

  Future<void> _postComment() async {
    final content = _commentController.text.trim();
    if (content.isEmpty) return;
    setState(() => commentPosting = true);
    try {
      final res = await ApiService.addComment(postId!, content);
      final newComment = res.data['comment'] as Map<String, dynamic>;

      // Attach current user info to comment for display
      final auth = context.read<AuthProvider>();
      newComment['users'] = {
        'name': auth.userName,
        'username': auth.userUsername,
        'profile_picture': auth.userAvatar,
        'id': auth.userId,
      };

      setState(() {
        comments = [...comments, newComment];
        _commentController.clear();
      });

      // Update comment count on post
      if (post != null) {
        setState(() {
          post!['comments_count'] =
              (post!['comments_count'] ?? 0) + 1;
        });
      }
    } catch (e) {
      debugPrint('Comment error: $e');
    } finally {
      setState(() => commentPosting = false);
    }
  }

  Future<void> _deleteComment(String commentId) async {
    try {
      await ApiService.deleteComment(commentId);
      setState(() =>
          comments.removeWhere((c) => c['id'] == commentId));
    } catch (e) {
      debugPrint('Delete comment error: $e');
    }
  }

  Future<void> _deletePost() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF18181B),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Post',
            style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.w700)),
        content: const Text(
            'Are you sure you want to delete this post?',
            style: TextStyle(color: Color(0xFF71717A))),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel',
                style: TextStyle(color: Color(0xFF71717A))),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete',
                style: TextStyle(
                    color: Color(0xFFF87171),
                    fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await ApiService.deletePost(postId!);
        if (mounted) Navigator.pop(context);
      } catch (e) {
        debugPrint('Delete post error: $e');
      }
    }
  }

  String _timeAgo(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final isOwner = auth.userId == post?['user_id'];
    final postUser = post?['users'] as Map<String, dynamic>?;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Post',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: [
          if (isOwner)
            IconButton(
              icon: const Icon(Icons.delete_outline,
                  color: Color(0xFFF87171)),
              onPressed: _deletePost,
            ),
        ],
      ),
      body: loading
          ? const Center(
              child: CircularProgressIndicator(
                  color: Color(0xFF2563EB)))
          : post == null
              ? const Center(
                  child: Text('Post not found',
                      style: TextStyle(color: Color(0xFFF87171))))
              : Column(
                  children: [
                    // ─── Scrollable content ───────────
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [

                            // ─── Post author ──────────
                            GestureDetector(
                              onTap: () => Navigator.pushNamed(
                                context, '/profile',
                                arguments: postUser?['username'],
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 22,
                                    backgroundColor:
                                        const Color(0xFF2563EB),
                                    backgroundImage:
                                        postUser?['profile_picture'] !=
                                                null
                                            ? NetworkImage(postUser![
                                                'profile_picture'])
                                            : null,
                                    child:
                                        postUser?['profile_picture'] ==
                                                null
                                            ? Text(
                                                (postUser?['name'] ??
                                                        'U')[0]
                                                    .toUpperCase(),
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight:
                                                      FontWeight.w700,
                                                  fontSize: 16,
                                                ),
                                              )
                                            : null,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          postUser?['name'] ?? '',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w700,
                                            fontSize: 15,
                                          ),
                                        ),
                                        Text(
                                          '@${postUser?['username'] ?? ''} · ${_timeAgo(post?['created_at'])}',
                                          style: const TextStyle(
                                            color: Color(0xFF71717A),
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 16),

                            // ─── Post content ─────────
                            if (post?['content'] != null &&
                                post!['content']
                                    .toString()
                                    .isNotEmpty)
                              Text(
                                post!['content'],
                                style: const TextStyle(
                                  color: Color(0xFFE4E4E7),
                                  fontSize: 16,
                                  height: 1.65,
                                ),
                              ),

                            // ─── Post image ───────────
                            if (post?['image_url'] != null) ...[
                              const SizedBox(height: 14),
                              ClipRRect(
                                borderRadius:
                                    BorderRadius.circular(16),
                                child: Image.network(
                                  post!['image_url'],
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) =>
                                      Container(
                                    height: 200,
                                    color: const Color(0xFF27272A),
                                    child: const Center(
                                      child: Icon(
                                          Icons.broken_image,
                                          color: Color(0xFF52525B),
                                          size: 40),
                                    ),
                                  ),
                                ),
                              ),
                            ],

                            const SizedBox(height: 16),

                            // ─── Like + comment stats ──
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  vertical: 12),
                              decoration: const BoxDecoration(
                                border: Border.symmetric(
                                  horizontal: BorderSide(
                                      color: Color(0xFF27272A)),
                                ),
                              ),
                              child: Row(
                                children: [
                                  // Like button
                                  GestureDetector(
                                    onTap: _toggleLike,
                                    child: Row(
                                      children: [
                                        likeLoading
                                            ? const SizedBox(
                                                width: 20,
                                                height: 20,
                                                child:
                                                    CircularProgressIndicator(
                                                  color: Color(
                                                      0xFF71717A),
                                                  strokeWidth: 1.5,
                                                ),
                                              )
                                            : Icon(
                                                liked
                                                    ? Icons.favorite
                                                    : Icons
                                                        .favorite_border,
                                                color: liked
                                                    ? const Color(
                                                        0xFFF87171)
                                                    : const Color(
                                                        0xFF71717A),
                                                size: 22,
                                              ),
                                        const SizedBox(width: 8),
                                        Text(
                                          '$likesCount likes',
                                          style: TextStyle(
                                            color: liked
                                                ? const Color(
                                                    0xFFF87171)
                                                : const Color(
                                                    0xFF71717A),
                                            fontSize: 14,
                                            fontWeight:
                                                FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 24),
                                  // Comment count
                                  Row(
                                    children: [
                                      const Icon(
                                          Icons.chat_bubble_outline,
                                          color: Color(0xFF71717A),
                                          size: 20),
                                      const SizedBox(width: 8),
                                      Text(
                                        '${post?['comments_count'] ?? comments.length} comments',
                                        style: const TextStyle(
                                          color: Color(0xFF71717A),
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Spacer(),
                                  // Engagement
                                  Row(
                                    children: [
                                      const Text('🔥',
                                          style:
                                              TextStyle(fontSize: 14)),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${post?['engagement_score'] ?? 0}',
                                        style: const TextStyle(
                                          color: Color(0xFF52525B),
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 20),

                            // ─── Comments heading ──────
                            Text(
                              'Comments (${comments.length})',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),

                            const SizedBox(height: 16),

                            // ─── Comments list ─────────
                            commentsLoading
                                ? const Center(
                                    child: Padding(
                                      padding: EdgeInsets.all(20),
                                      child: CircularProgressIndicator(
                                        color: Color(0xFF2563EB),
                                        strokeWidth: 2,
                                      ),
                                    ),
                                  )
                                : comments.isEmpty
                                    ? Container(
                                        padding: const EdgeInsets.all(
                                            24),
                                        decoration: BoxDecoration(
                                          color:
                                              const Color(0xFF18181B),
                                          borderRadius:
                                              BorderRadius.circular(
                                                  16),
                                          border: Border.all(
                                              color: const Color(
                                                  0xFF27272A)),
                                        ),
                                        child: const Center(
                                          child: Column(
                                            children: [
                                              Text('💬',
                                                  style: TextStyle(
                                                      fontSize: 32)),
                                              SizedBox(height: 8),
                                              Text(
                                                'No comments yet',
                                                style: TextStyle(
                                                  color:
                                                      Color(0xFF71717A),
                                                  fontSize: 14,
                                                ),
                                              ),
                                              Text(
                                                'Be the first to comment!',
                                                style: TextStyle(
                                                  color:
                                                      Color(0xFF52525B),
                                                  fontSize: 12,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      )
                                    : ListView.separated(
                                        shrinkWrap: true,
                                        physics:
                                            const NeverScrollableScrollPhysics(),
                                        itemCount: comments.length,
                                        separatorBuilder: (_, __) =>
                                            const SizedBox(height: 12),
                                        itemBuilder: (context, index) {
                                          final comment =
                                              comments[index];
                                          final commentUser = comment['users'] as Map<String, dynamic>?;
                                          final isCommentOwner =
                                              auth.userId ==
                                                  comment['user_id'];

                                          return Row(
                                            crossAxisAlignment:
                                                CrossAxisAlignment
                                                    .start,
                                            children: [
                                              // Avatar
                                              GestureDetector(
                                                onTap: () => Navigator
                                                    .pushNamed(
                                                  context, '/profile',
                                                  arguments: commentUser
                                                      ?['username'],
                                                ),
                                                child: CircleAvatar(
                                                  radius: 16,
                                                  backgroundColor:
                                                      const Color(
                                                          0xFF2563EB),
                                                  backgroundImage: commentUser?[
                                                              'profile_picture'] !=
                                                          null
                                                      ? NetworkImage(
                                                          commentUser![
                                                              'profile_picture'])
                                                      : null,
                                                  child: commentUser?[
                                                              'profile_picture'] ==
                                                          null
                                                      ? Text(
                                                          (commentUser?[
                                                                      'name'] ??
                                                                  'U')[0]
                                                              .toUpperCase(),
                                                          style: const TextStyle(
                                                            color: Colors
                                                                .white,
                                                            fontSize: 11,
                                                            fontWeight:
                                                                FontWeight
                                                                    .w700,
                                                          ),
                                                        )
                                                      : null,
                                                ),
                                              ),
                                              const SizedBox(width: 10),
                                              // Comment bubble
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment
                                                          .start,
                                                  children: [
                                                    Container(
                                                      padding:
                                                          const EdgeInsets
                                                              .all(12),
                                                      decoration:
                                                          BoxDecoration(
                                                        color: const Color(
                                                            0xFF18181B),
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(
                                                                    14),
                                                        border: Border.all(
                                                            color: const Color(
                                                                0xFF27272A)),
                                                      ),
                                                      child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Row(
                                                            children: [
                                                              Expanded(
                                                                child:
                                                                    GestureDetector(
                                                                  onTap: () =>
                                                                      Navigator.pushNamed(
                                                                    context,
                                                                    '/profile',
                                                                    arguments:
                                                                        commentUser?['username'],
                                                                  ),
                                                                  child:
                                                                      Text(
                                                                    commentUser?['name'] ??
                                                                        'User',
                                                                    style:
                                                                        const TextStyle(
                                                                      color: Colors
                                                                          .white,
                                                                      fontWeight:
                                                                          FontWeight.w600,
                                                                      fontSize:
                                                                          13,
                                                                    ),
                                                                  ),
                                                                ),
                                                              ),
                                                              if (isCommentOwner)
                                                                GestureDetector(
                                                                  onTap: () =>
                                                                      _deleteComment(
                                                                          comment['id']),
                                                                  child:
                                                                      const Icon(
                                                                    Icons
                                                                        .close,
                                                                    color: Color(
                                                                        0xFF52525B),
                                                                    size:
                                                                        14,
                                                                  ),
                                                                ),
                                                            ],
                                                          ),
                                                          const SizedBox(
                                                              height: 4),
                                                          Text(
                                                            comment[
                                                                'content'],
                                                            style:
                                                                const TextStyle(
                                                              color: Color(
                                                                  0xFFD4D4D8),
                                                              fontSize:
                                                                  14,
                                                              height: 1.5,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                    Padding(
                                                      padding:
                                                          const EdgeInsets
                                                              .only(
                                                              left: 12,
                                                              top: 4),
                                                      child: Text(
                                                        _timeAgo(comment[
                                                            'created_at']),
                                                        style:
                                                            const TextStyle(
                                                          color: Color(
                                                              0xFF52525B),
                                                          fontSize: 11,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          );
                                        },
                                      ),

                            // Bottom padding for input bar
                            const SizedBox(height: 80),
                          ],
                        ),
                      ),
                    ),

                    // ─── Comment input bar ────────────
                    Container(
                      padding: EdgeInsets.only(
                        left: 16,
                        right: 16,
                        top: 12,
                        bottom: MediaQuery.of(context).viewInsets.bottom +
                            12,
                      ),
                      decoration: const BoxDecoration(
                        color: Color(0xFF09090B),
                        border: Border(
                          top: BorderSide(color: Color(0xFF27272A)),
                        ),
                      ),
                      child: Row(
                        children: [
                          // Avatar
                          CircleAvatar(
                            radius: 16,
                            backgroundColor: const Color(0xFF2563EB),
                            backgroundImage: auth.userAvatar != null
                                ? NetworkImage(auth.userAvatar!)
                                : null,
                            child: auth.userAvatar == null
                                ? Text(
                                    auth.userName.isNotEmpty
                                        ? auth.userName[0].toUpperCase()
                                        : 'U',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 11,
                                    ),
                                  )
                                : null,
                          ),
                          const SizedBox(width: 10),
                          // Input
                          Expanded(
                            child: TextField(
                              controller: _commentController,
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 14),
                              decoration: InputDecoration(
                                hintText: 'Write a comment...',
                                hintStyle: const TextStyle(
                                    color: Color(0xFF52525B)),
                                filled: true,
                                fillColor: const Color(0xFF18181B),
                                border: OutlineInputBorder(
                                  borderRadius:
                                      BorderRadius.circular(100),
                                  borderSide: const BorderSide(
                                      color: Color(0xFF27272A)),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius:
                                      BorderRadius.circular(100),
                                  borderSide: const BorderSide(
                                      color: Color(0xFF27272A)),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius:
                                      BorderRadius.circular(100),
                                  borderSide: const BorderSide(
                                      color: Color(0xFF2563EB),
                                      width: 1.5),
                                ),
                                contentPadding:
                                    const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 10),
                              ),
                              onSubmitted: (_) => _postComment(),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Send button
                          GestureDetector(
                            onTap: commentPosting ? null : _postComment,
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: const Color(0xFF2563EB),
                                borderRadius: BorderRadius.circular(100),
                              ),
                              child: commentPosting
                                  ? const Padding(
                                      padding: EdgeInsets.all(10),
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Icon(Icons.send_rounded,
                                      color: Colors.white, size: 18),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}